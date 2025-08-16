import { Contributor } from "@/types/student_project";
import { group } from "console";
import { redirect } from "next/navigation";

export const setVisibility = async (project_id: string, visibility: string) => {
  const response = await fetch(`/api/v1/project/${project_id}/visibility`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visibility }),
  });

  return { ok: response.ok, message: await response.text() };
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
    return { ok: false, message: await res.text() };
  }

  return { ok: true, message: undefined };
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
