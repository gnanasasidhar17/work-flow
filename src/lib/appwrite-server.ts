import { Client, Databases, Users, Storage } from "node-appwrite";

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
    .setKey(process.env.APPWRITE_API_KEY || "");

  return {
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}

export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
    .setSession(session);

  return {
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}
