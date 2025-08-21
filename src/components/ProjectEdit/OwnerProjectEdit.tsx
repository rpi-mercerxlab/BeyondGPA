"use client";

import {
  Group,
  Link,
  QuestionPrompt,
  SkillTag,
  StudentProject,
} from "@/types/student_project";
import { useEffect, useState } from "react";
import OwnersToolbox from "./OwnersToolbox";
import {
  addContributor,
  assignGroup,
  createNewGroup,
  deleteProject,
  removeContributor,
  setVisibility,
  transferOwnership,
  updateContributor,
  updateTitle,
  updateThumbnail,
  updateThumbnailCaption,
  deleteThumbnail,
  addImage,
  updateImageCaption,
  deleteImage,
  assignSkillTagToProject,
  removeSkillTagFromProject,
  createSkillTag,
  createLink,
  updateLink,
  deleteLink,
  updateDescription,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/actions/student_project";
import ContributorEditableItems from "./ContributorEditableItems";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";
import { ArrowLeftIcon } from "lucide-react";

export default function OwnerProjectEdit({
  project,
}: {
  project: StudentProject;
}) {
  const [clientProject, updateProject] = useState<StudentProject>(project);
  const [loaded, setLoaded] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [availableSkillTags, setAvailableSkillTags] = useState<SkillTag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [availableGroupsResp, skillTagsResp] = await Promise.all([
        fetch(`/api/v1/project/groups`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch(`/api/v1/project/skill-tags`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!availableGroupsResp.ok) {
        setError(await availableGroupsResp.text());
        return;
      }

      const groups = await availableGroupsResp.json();
      setAvailableGroups(groups.groups);

      if (!skillTagsResp.ok) {
        setError(await skillTagsResp.text());
        return;
      }

      const skillTags = await skillTagsResp.json();
      setAvailableSkillTags(skillTags.tags);
      setLoaded(true);
    };
    fetchData();
  }, []);

  const project_id = project.project_id;

  return (
    <div className="flex flex-col space-y-4 w-full p-4">
      {loaded ? (
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex items-center justify-between">
            <a
              className="flex items-center text-xl text-primary"
              href={`/project/${project!.project_id}`}
            >
              <ArrowLeftIcon size={32} /> View Project
            </a>
            <p>
              Created On: {new Date(project.createdAt).toLocaleDateString()}
            </p>
            <p>
              Last Updated: {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
          {error && (
            <div className="text-red-500 text-sm my-0.5">
              Error Changing Title: {error}
            </div>
          )}
          <BeyondLineEdit
            className="text-3xl! font-bold text-primary w-full"
            placeholder="Enter project title"
            value={project.title}
            debounceDuration={1000}
            onChange={async (value) => {
              const resp = await updateTitle(project_id, value);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  title: value,
                }));
              }
              setError(resp.message ? resp.message : null);
            }}
          />
          <OwnersToolbox
            project={clientProject}
            availableGroups={availableGroups}
            setVisibility={async (visibility) => {
              const resp = await setVisibility(project.project_id, visibility);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  visibility,
                }));
              }
              return resp;
            }}
            transferOwnership={async (email) =>
              await transferOwnership(project.project_id, email)
            }
            onCreateGroup={async (name) => {
              const resp = await createNewGroup(name);
              if (!resp.ok) {
                return resp;
              }
              setAvailableGroups((prev) => [...prev, resp.group]);
              return resp;
            }}
            onSetGroup={async (group_id) => {
              const resp = await assignGroup(project_id, group_id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  group: resp.group,
                }));
              }
              return resp;
            }}
            onDeleteProject={async () => await deleteProject(project_id)}
            onAddContributor={async () => {
              const resp = await addContributor(project_id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  contributors: [
                    ...prev.contributors,
                    { id: resp.id, name: "", email: "", role: "VIEWER" },
                  ],
                }));
              }
              return resp;
            }}
            onRemoveContributor={async (contributorId) => {
              const resp = await removeContributor(project_id, contributorId);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  contributors: prev.contributors.filter(
                    (c) => c.id !== contributorId
                  ),
                }));
              }
              return resp;
            }}
            onUpdateContributor={async (contributor) => {
              const resp = await updateContributor(project_id, contributor);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  contributors: prev.contributors.map((c) =>
                    c.id === contributor.id ? contributor : c
                  ),
                }));
              }
              return resp;
            }}
          />
          <ContributorEditableItems
            project={clientProject}
            availableSkillTags={availableSkillTags}
            onThumbnailChange={async (thumbnail: File | string) => {
              const resp = await updateThumbnail(project_id, thumbnail);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  thumbnail: {
                    url: resp.image!.url,
                    alt: resp.image!.altText,
                    id: resp.image!.id,
                  },
                  storageRemaining: resp.image!.storageRemaining!,
                }));
              }
              return { ...resp, url: resp.image?.url };
            }}
            onThumbnailCaptionChange={async (newCaption: string) => {
              const resp = await updateThumbnailCaption(project_id, newCaption);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  thumbnail: {
                    ...prev.thumbnail!,
                    alt: newCaption,
                  },
                }));
              }
              return resp;
            }}
            onThumbnailDelete={async () => {
              const resp = await deleteThumbnail(project_id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  thumbnail: null,
                  storageRemaining: resp.storageRemaining,
                }));
              }
              return resp;
            }}
            onAddImage={async (image: File | string) => {
              const resp = await addImage(project_id, image);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  images: [...prev.images, resp.image!],
                  storageRemaining: resp.image!.storageRemaining,
                }));
              }
              return resp;
            }}
            onImageCaptionChange={async (
              imageId: string,
              newCaption: string
            ) => {
              const resp = await updateImageCaption(
                project_id,
                imageId,
                newCaption
              );
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  images: prev.images.map((img) =>
                    img.id === imageId ? { ...img, caption: newCaption } : img
                  ),
                }));
              }
              return resp;
            }}
            onImageDelete={async (imageId: string) => {
              const resp = await deleteImage(project_id, imageId);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  images: prev.images.filter((img) => img.id !== imageId),
                  storageRemaining: resp.storageRemaining,
                }));
              }
              return resp;
            }}
            onAddSkillTag={async (newTag: SkillTag) => {
              const resp = await assignSkillTagToProject(project_id, newTag.id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  skillTags: [...prev.skillTags, newTag],
                }));
              }
              return resp;
            }}
            onRemoveSkillTag={async (tag: SkillTag) => {
              const resp = await removeSkillTagFromProject(project_id, tag.id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  skillTags: prev.skillTags.filter((t) => t.id !== tag.id),
                }));
              }
              return resp;
            }}
            onCreateSkillTag={async (name: string) => {
              const resp = await createSkillTag(name);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  skillTags: [...prev.skillTags, resp.tag!],
                }));
                setAvailableSkillTags((prev) => [...prev, resp.tag!]);
              }
              return resp;
            }}
            onAddLink={async () => {
              const resp = await createLink(project_id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  links: [...prev.links, resp.link!],
                }));
              }
              return resp;
            }}
            onLinkChange={async (newLink: Link) => {
              const resp = await updateLink(project_id, newLink);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  links: prev.links.map((link) =>
                    link.id === newLink.id ? newLink : link
                  ),
                }));
              }
              return resp;
            }}
            onLinkDelete={async (linkId: string) => {
              const resp = await deleteLink(project_id, linkId);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  links: prev.links.filter((link) => link.id !== linkId),
                }));
              }
              return resp;
            }}
            onDescriptionChange={async (newDescription: string) => {
              const resp = await updateDescription(project_id, newDescription);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  description: newDescription,
                }));
              }
              return resp;
            }}
            onAddQuestion={async () => {
              const resp = await createQuestion(project_id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  questions: [...prev.questions, resp.question!],
                }));
              }
              return resp;
            }}
            onQuestionChange={async (updatedQuestion: QuestionPrompt) => {
              const resp = await updateQuestion(project_id, updatedQuestion);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  questions: prev.questions.map((q) =>
                    q.id === updatedQuestion.id ? updatedQuestion : q
                  ),
                }));
              }
              return resp;
            }}
            onQuestionDelete={async (questionId: string) => {
              const resp = await deleteQuestion(project_id, questionId);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  questions: prev.questions.filter((q) => q.id !== questionId),
                }));
              }
              return resp;
            }}
          />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
