import { createRefreshTokenHttpClient } from "@/client/HttpClient";

const client = createRefreshTokenHttpClient("/student-conversation");

export const syncStudentTags = async () => { 
    return await client.post("");
}