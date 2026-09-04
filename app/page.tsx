import LimestoneERP from '../components/limestone-erp';
import { requireChatGPTUser } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home(){
  const user = await requireChatGPTUser('/');
  return <LimestoneERP currentUser={{ name: user.displayName, email: user.email }}/>;
}
