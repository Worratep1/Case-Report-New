import client from "./client";

export const getGroups = async () => {
  const response = await client.get("/groups");
  return response.data.groups;
};

export const createGroup = async (groupData) => {
  const response = await client.post("/groups", groupData);
  return response.data;
};

export const updateGroup = async (id, groupData) => {
  const response = await client.put(`/groups/${id}`, groupData);
  return response.data;
};

export const deleteGroup = async (id) => {
  const response = await client.delete(`/groups/${id}`);
  return response.data;
};