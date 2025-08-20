import { NEXT_AUTH } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Home() {

  const session = await getServerSession(NEXT_AUTH)

  return (
    <div>{JSON.stringify(session)}
      Hello world
    </div>
  );
}
