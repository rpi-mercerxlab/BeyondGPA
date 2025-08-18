export type StudentProject = {
  project_id: string;
  title: string;
  visibility: ProjectVisibility;
  owner: {
    name: string;
    email: string;
  };
  contributors: Contributor[];
  skill_tags: SkillTag[];
  images: Image[];
  thumbnail: Image | undefined | null;
  links: Link[];
  description: string;
  questions: QuestionPrompt[];
  group: Group;
  createdAt: string;
  updatedAt: string;
  storageRemaining: number;
};

export type Image = {
  id: string;
  url: string;
  alt: string;
};

export type QuestionPrompt = {
  id: string;
  question: string;
  answer: string;
};

export type Link = {
  id: string;
  link: string;
  coverText: string;
};

export type ProjectVisibility = "DRAFT" | "PUBLIC" | "DELETED";

export type Contributor = {
  name: string;
  email: string;
  role: "EDITOR" | "VIEWER";
  id: string;
};

export type SkillTag = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
};
