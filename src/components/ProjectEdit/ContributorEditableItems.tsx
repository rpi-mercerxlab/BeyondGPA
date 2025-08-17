"use client";

import {
  Link,
  SkillTag,
  StudentProject,
  QuestionPrompt,
} from "@/types/student_project";
import SingleImageUpload from "../common/SingleImageUpload";
import MultiImageUpload from "../common/MultiImageUpload";
import BeyondButton from "../common/BeyondButton";
import TagSelector from "./SkillTagSelector";
import RichTextEditor from "../common/RichTextEditor/component";
import { useState } from "react";
import QuestionInput from "./QuestionEdit";

export default function ContributorEditableItems({
  project,
  availableSkillTags,
  onThumbnailChange,
  onThumbnailCaptionChange,
  onThumbnailDelete,
  onAddImage,
  onImageCaptionChange,
  onImageDelete,
  onAddSkillTag,
  onRemoveSkillTag,
  onCreateSkillTag,
  onAddLink,
  onLinkChange,
  onLinkDelete,
  onDescriptionChange,
  onAddQuestion,
  onQuestionChange,
  onQuestionDelete,
}: {
  project: StudentProject;
  availableSkillTags: SkillTag[];
  onThumbnailChange: (
    thumbnail: File | string
  ) => Promise<{ ok: boolean; message: string }>;
  onThumbnailCaptionChange: (
    newCaption: string
  ) => Promise<{ ok: boolean; message: string }>;
  onThumbnailDelete: () => Promise<{ ok: boolean; message: string }>;
  onAddImage: (
    image: File | string
  ) => Promise<{ ok: boolean; message: string }>;
  onImageCaptionChange: (
    imageId: string,
    newCaption: string
  ) => Promise<{ ok: boolean; message: string }>;
  onImageDelete: (imageId: string) => Promise<{ ok: boolean; message: string }>;
  onAddSkillTag: (tag: SkillTag) => Promise<{ ok: boolean; message: string }>;
  onRemoveSkillTag: (
    tag: SkillTag
  ) => Promise<{ ok: boolean; message: string }>;
  onCreateSkillTag: (name: string) => Promise<{ ok: boolean; message: string }>;
  onAddLink: () => Promise<{ ok: boolean; message: string }>;
  onLinkChange: (newLink: Link) => Promise<{ ok: boolean; message: string }>;
  onLinkDelete: (linkId: string) => Promise<{ ok: boolean; message: string }>;
  onDescriptionChange: (
    newDescription: string
  ) => Promise<{ ok: boolean; message: string }>;
  onAddQuestion: () => Promise<{ ok: boolean; message: string }>;
  onQuestionChange: (
    newQuestion: QuestionPrompt
  ) => Promise<{ ok: boolean; message: string }>;
  onQuestionDelete: (
    questionId: string
  ) => Promise<{ ok: boolean; message: string }>;
}) {
  const [description, setDescription] = useState(project.description);

  return (
    <div>
      <div>
        <div>
          <h1>Thumbnail</h1>
          <SingleImageUpload
            existingImage={project.thumbnail?.url}
            existingAlt={project.thumbnail?.alt}
            onAltChange={onThumbnailCaptionChange}
            onDelete={onThumbnailDelete}
            onUpload={onThumbnailChange}
            onUrlChange={onThumbnailChange}
            storageRemaining={project.storageRemaining}
          />
        </div>
        <div>
          <h1>Images</h1>
          <MultiImageUpload
            images={project.images}
            storageRemaining={project.storageRemaining}
            onUpload={onAddImage}
            onAltChange={onImageCaptionChange}
            onDelete={onImageDelete}
            onLink={onAddImage}
          />
        </div>
        <div>
          <h1>Links</h1>
          {project.links.map((link) => (
            <div key={link.id}>
              <input
                type="text"
                value={link.link}
                onChange={(e) =>
                  onLinkChange({ ...link, link: e.target.value })
                }
              />
              <input
                type="text"
                value={link.coverText}
                onChange={(e) =>
                  onLinkChange({ ...link, coverText: e.target.value })
                }
              />
              <BeyondButton onClick={() => onLinkDelete(link.id)}>
                Delete
              </BeyondButton>
            </div>
          ))}
          <BeyondButton onClick={onAddLink}>Add Link</BeyondButton>
        </div>
        <div>
          <h1>Tags</h1>
          <TagSelector
            availableTags={availableSkillTags}
            onTagSelect={onAddSkillTag}
            onTagDeselect={onRemoveSkillTag}
            onCreateTag={onCreateSkillTag}
          />
        </div>
      </div>
      <h1>Description</h1>
      <RichTextEditor
        onChange={setDescription}
        content={description}
        onBlur={() => onDescriptionChange(description)}
      />
      <h1>Questions</h1>
      {project.questions.map((question) => (
        <QuestionInput
          prompt={question.question}
          answer={question.answer}
          onAnswerChange={(newAnswer) =>
            onQuestionChange({ ...question, answer: newAnswer })
          }
          onPromptChange={(newPrompt) =>
            onQuestionChange({ ...question, question: newPrompt })
          }
          onDelete={() => onQuestionDelete(question.id)}
        />
      ))}
    </div>
  );
}
