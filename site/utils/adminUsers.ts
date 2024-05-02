const adminUsers = process.env.ADMIN_USERS?.split(",") || [];

export default (userId: string) => adminUsers.includes(userId);
