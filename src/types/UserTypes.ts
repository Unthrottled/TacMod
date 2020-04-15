export type User = {
  fullName: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  guid: string;
};

export interface UserOnBoarding {
  welcomed?: boolean;
  TacModNotified?: boolean;
  TacModDownloaded?: boolean;
  TacModThanked?: boolean;
}

export type UserResponse = {
  information: User;
  security: { verificationKey: string };
  misc: {
    onboarding: UserOnBoarding;
  };
};
