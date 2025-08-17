import { Contributor, Link, QuestionPrompt } from "@/types/student_project";
import { redirect } from "next/navigation";

export const setVisibility = async (project_id: string, visibility: string) => {
  const response = await fetch(`/api/v1/project/${project_id}/visibility`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visibility }),
  });

  return { ok: response.ok, message: await response.text(), visibility };
};

export const transferOwnership = async (project_id: string, email: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/owner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }

  redirect(`/project/${project_id}`);
};

export const assignGroup = async (project_id: string, groupId?: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/group`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ group_id: groupId }),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), group: undefined };
  }

  return {
    ok: res.ok,
    message: undefined,
    group: await res.json().then((data) => data.group),
  };
};

export const deleteProject = async (project_id: string) => {
  const res = await fetch(`/api/v1/project/${project_id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }
  redirect("/");
};

export const addContributor = async (project_id: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/contributor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), id: undefined };
  }

  return {
    ok: true,
    message: undefined,
    id: await res.json().then((data) => data.id),
  };
};

export const removeContributor = async (
  project_id: string,
  contributorId: string
) => {
  const res = await fetch(
    `/api/v1/project/${project_id}/contributor/${contributorId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }

  return { ok: true, message: undefined };
};

export const updateContributor = async (
  project_id: string,
  contributor: Contributor
) => {
  const res = await fetch(
    `/api/v1/project/${project_id}/contributor/${contributor.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: contributor.name,
        email: contributor.email,
        role: contributor.role,
      }),
    }
  );

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }

  return { ok: true, message: undefined };
};

export const updateTitle = async (project_id: string, title: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/title`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return { ok: res.ok, message: await res.text() };
};

export const createNewGroup = async (name: string) => {
  const res = await fetch(`/api/v1/project/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }

  const group = await res.json();
  return { ok: true, message: undefined, group };
};

type UpdateThumbnailResponse = {
  id: string;
  altText: string;
  url: string;
  storageRemaining: number;
};

export const updateThumbnail = async (
  project_id: string,
  thumbnail: File | string
) => {
  let res;
  if (typeof thumbnail === "string") {
    res = await fetch(`/api/v1/project/${project_id}/thumbnail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ thumbnail }),
    });
  } else {
    res = await fetch(`/api/v1/project/${project_id}/thumbnail`, {
      method: "POST",
      body: thumbnail,
      headers: {
        "Content-Type": thumbnail.type,
      },
    });
  }

  if (!res.ok) {
    return { ok: false, message: await res.text(), image: undefined };
  }

  return {
    ok: true,
    message: undefined,
    image: (await res.json()) as UpdateThumbnailResponse,
  };
};

export const updateThumbnailCaption = async (
  project_id: string,
  newCaption: string
) => {
  const res = await fetch(`/api/v1/project/${project_id}/thumbnail/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ alt: newCaption }),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), caption: undefined };
  }

  return { ok: true, message: undefined, caption: newCaption };
};

export const deleteThumbnail = async (project_id: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/thumbnail`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }

  return { ok: true, message: undefined };
};

type ImageResponse = {
  id: string;
  url: string;
  alt: string;
  storageRemaining: number;
};

export const addImage = async (project_id: string, image: File | string) => {
  let res;
  if (typeof image === "string") {
    res = await fetch(`/api/v1/project/${project_id}/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });
  } else {
    res = await fetch(`/api/v1/project/${project_id}/image`, {
      method: "POST",
      body: image,
      headers: {
        "Content-Type": image.type,
      },
    });
  }

  if (!res.ok) {
    return { ok: false, message: await res.text(), image: undefined };
  }

  return {
    ok: true,
    message: undefined,
    image: (await res.json()) as ImageResponse,
  };
};

export const updateImageCaption = async (
  project_id: string,
  imageId: string,
  newCaption: string
) => {
  const res = await fetch(`/api/v1/project/${project_id}/image/${imageId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ alt: newCaption }),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), caption: undefined };
  }

  return { ok: true, message: undefined, caption: newCaption };
};

export const deleteImage = async (project_id: string, imageId: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/image/${imageId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }

  return { ok: true, message: undefined };
};

export const createLink = async (project_id: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/link`, {
    method: "POST",
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), link: undefined };
  }

  return { ok: true, message: undefined, link: (await res.json()) as Link };
};

export const updateLink = async (project_id: string, link: Link) => {
  const res = await fetch(`/api/v1/project/${project_id}/link/${link.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(link),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), link: undefined };
  }

  return { ok: true, message: undefined, link: (await res.json()) as Link };
};

export const deleteLink = async (project_id: string, linkId: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/link/${linkId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), link: undefined };
  }

  return { ok: true, message: undefined, link: (await res.json()) as Link };
};

export const updateDescription = async (
  project_id: string,
  newDescription: string
) => {
  const res = await fetch(`/api/v1/project/${project_id}/description`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description: newDescription }),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), description: undefined };
  }

  return { ok: true, message: undefined, description: newDescription };
};

export const createQuestion = async (project_id: string) => {
  const res = await fetch(`/api/v1/project/${project_id}/question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    return { ok: false, message: await res.text(), question: undefined };
  }

  return {
    ok: true,
    message: undefined,
    question: (await res.json()) as QuestionPrompt,
  };
};

export const updateQuestion = async (
  project_id: string,
  newQuestion: QuestionPrompt
) => {
  const res = await fetch(
    `/api/v1/project/${project_id}/question/${newQuestion.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newQuestion),
    }
  );

  if (!res.ok) {
    return { ok: false, message: await res.text(), question: undefined };
  }

  return {
    ok: true,
    message: undefined,
    question: (await res.json()) as QuestionPrompt,
  };
};

export const deleteQuestion = async (
  project_id: string,
  questionId: string
) => {
  const res = await fetch(
    `/api/v1/project/${project_id}/question/${questionId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return { ok: false, message: await res.text() };
  }

  return { ok: true, message: undefined };
};
