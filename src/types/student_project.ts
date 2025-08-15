export type StudentProject = {
  project_id: string;
  title: string;
  visibility: "DRAFT" | "PUBLIC";
  owner: {
    name: string;
    email: string;
  };
  contributors: Contributor[];
  skill_tags: SkillTag[];
  images: {
    link: string;
    caption: string;
    id: string;
  }[];
  thumbnail: {
    link: string | undefined;
    caption: string | undefined;
  };
  links: {
    link: string;
    coverText: string;
    id: string;
  }[];
  description: string;
  questions: {
    id: string;
    questionText: string;
    answerText: string;
  }[];
  group: Group;
  createdAt: string;
  updatedAt: string;
};

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
