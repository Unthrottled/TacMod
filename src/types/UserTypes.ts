export type User = {
  fullName: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  guid: string;
};

export type UserResponse = {
  information: User;
  security: {verificationKey: string};
};
