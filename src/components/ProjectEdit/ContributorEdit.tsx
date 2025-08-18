"use client";

import {
  StudentProject,
  QuestionPrompt,
  SkillTag,
  Link,
} from "@/types/student_project";
import { useEffect, useState } from "react";
import ReadOnlyOwnerOptions from "./ReadOnlyOwnerOptions";
import ContributorEditableItems from "./ContributorEditableItems";
import {
  addImage,
  assignSkillTagToProject,
  createLink,
  createQuestion,
  createSkillTag,
  deleteImage,
  deleteLink,
  deleteQuestion,
  deleteThumbnail,
  removeSkillTagFromProject,
  updateDescription,
  updateImageCaption,
  updateLink,
  updateQuestion,
  updateThumbnail,
  updateThumbnailCaption,
} from "@/lib/actions/student_project";
import { ArrowLeftIcon } from "lucide-react";

export default function ContributorProjectEdit({
  project,
}: {
  project: StudentProject;
}) {
  const [error, setError] = useState<string | null>(null);
  const [clientProject, updateProject] = useState<StudentProject>(project);
  const [loaded, setLoaded] = useState(false);
  const [availableSkillTags, setAvailableSkillTags] = useState<SkillTag[]>([]);

  const project_id = project.project_id;

  useEffect(() => {
    const fetchData = async () => {
      const [skillTagsResp] = await Promise.all([
        fetch(`/api/v1/project/skill-tags`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

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
          <h1 className="text-2xl font-bold text-primary">{project.title}</h1>
          {error && (
            <div className="text-red-500 flex items-center space-x-2">
              <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center mx-2">
                !
              </span>
              {error}. Please try again.
            </div>
          )}
          <ReadOnlyOwnerOptions project={project} />
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
                  storageRemaining: resp.image?.storageRemaining!,
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
                  skill_tags: [...prev.skill_tags, newTag],
                }));
              }
              return resp;
            }}
            onRemoveSkillTag={async (tag: SkillTag) => {
              const resp = await removeSkillTagFromProject(project_id, tag.id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  skill_tags: prev.skill_tags.filter((t) => t.id !== tag.id),
                }));
              }
              return resp;
            }}
            onCreateSkillTag={async (name: string) => {
              const resp = await createSkillTag(name);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev!,
                  skill_tags: [...prev.skill_tags, resp.tag!],
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
