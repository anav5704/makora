export const isUnrecoverableJobError = (error: string | null | undefined): boolean => {
    if (!error) return false;

    return error.includes("user not found");
};
