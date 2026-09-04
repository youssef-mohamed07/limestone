import LimestoneERP from '../components/limestone-erp';
import { requireChatGPTUser } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home(){
  await requireChatGPTUser('/');
  return <LimestoneERP/>;
}
