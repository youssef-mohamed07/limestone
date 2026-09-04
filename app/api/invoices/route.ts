import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { activityLogs, invoiceItems, invoices } from '../../../db/schema';
import { calculateInvoiceTotals } from '../../../lib/calculations';
import { invoiceSchema } from '../../../lib/validation';

export async function GET(){
  const user=await getChatGPTUser();
  if(!user)return NextResponse.json({error:'Authentication required'},{status:401});
  try{return NextResponse.json({invoices:await getDb().select().from(invoices).where(eq(invoices.archived,false))})}
  catch{return NextResponse.json({error:'Invoice storage is not available yet'},{status:503})}
}
export async function POST(request:Request){
  const user=await getChatGPTUser();
  if(!user)return NextResponse.json({error:'Authentication required'},{status:401});
  try{
    const body=await request.json();
    const parsed=invoiceSchema.safeParse({number:body.number,invoiceDate:body.date,customerId:body.customerId,currency:body.currency,containerQuantity:body.containers,freightPerContainerMinor:body.freightPerContainerMinor,downPaymentPercent:body.downPaymentPercent,items:body.items});
    if(!parsed.success)return NextResponse.json({error:'Invalid invoice',issues:parsed.error.flatten()},{status:400});
    const totals=calculateInvoiceTotals({items:parsed.data.items,containers:parsed.data.containerQuantity,freightPerContainerMinor:parsed.data.freightPerContainerMinor,downPaymentPercent:parsed.data.downPaymentPercent});
    const db=getDb();const existing=await db.select({id:invoices.id}).from(invoices).where(eq(invoices.number,parsed.data.number)).limit(1);
    if(existing.length)return NextResponse.json({error:'Invoice number already exists'},{status:409});
    const now=new Date().toISOString(),invoiceId=typeof body.id==='string'?body.id:crypto.randomUUID();
    await db.insert(invoices).values({id:invoiceId,number:parsed.data.number,invoiceDate:parsed.data.invoiceDate,customerId:parsed.data.customerId,currency:parsed.data.currency,status:body.status??'DRAFT',portLoading:body.portLoading??'Any Egyptian Port',portDischarge:body.portDischarge??'',originCountry:'Egypt',destinationCountry:body.destinationCountry??'',containerQuantity:parsed.data.containerQuantity,containerType:body.containerType??"20' GP",freightPerContainerMinor:parsed.data.freightPerContainerMinor,downPaymentPercent:parsed.data.downPaymentPercent,paidMinor:0,paymentTerms:body.paymentTerms??`${parsed.data.downPaymentPercent}% down payment and balance upon receipt of documents`,notes:body.notes??'',createdAt:now,updatedAt:now});
    await db.insert(invoiceItems).values(parsed.data.items.map((item,position)=>({id:crypto.randomUUID(),invoiceId,description:item.description,finish:item.finish,size:item.size,quantity:item.quantity,unit:item.unit,unitPriceMinor:item.unitPriceMinor,hsCode:item.hsCode,crates:item.crates,position,createdAt:now,updatedAt:now})));
    await db.insert(activityLogs).values({id:crypto.randomUUID(),userId:user.userId,action:'INVOICE_CREATED',entity:'Invoice',entityId:invoiceId,newValue:JSON.stringify({number:parsed.data.number,grandTotalMinor:totals.grandTotalMinor}),createdAt:now});
    return NextResponse.json({id:invoiceId,totals},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to save invoice'},{status:500})}
}
