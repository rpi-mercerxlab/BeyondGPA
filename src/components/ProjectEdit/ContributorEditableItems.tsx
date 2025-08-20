"use client";

import {
  Link,
  SkillTag,
  StudentProject,
  QuestionPrompt,
} from "@/types/student_project";
import SingleImageUpload from "../common/SingleImageUpload";
import MultiImageUpload from "../common/MultiImageUpload";
import BeyondButton from "../common/BeyondComponents/BeyondButton";
import TagSelector from "../common/SkillTagSelector";
import RichTextEditor from "../common/RichTextEditor/component";
import { useState } from "react";
import QuestionInput from "./QuestionEdit";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";

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
  ) => Promise<{ ok: boolean; message?: string; url?: string }>;
  onThumbnailCaptionChange: (
    newCaption: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onThumbnailDelete: () => Promise<{ ok: boolean; message?: string }>;
  onAddImage: (
    image: File | string
  ) => Promise<{ ok: boolean; message?: string }>;
  onImageCaptionChange: (
    imageId: string,
    newCaption: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onImageDelete: (
    imageId: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onAddSkillTag: (tag: SkillTag) => Promise<{ ok: boolean; message?: string }>;
  onRemoveSkillTag: (
    tag: SkillTag
  ) => Promise<{ ok: boolean; message?: string }>;
  onCreateSkillTag: (
    name: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onAddLink: () => Promise<{ ok: boolean; message?: string }>;
  onLinkChange: (newLink: Link) => Promise<{ ok: boolean; message?: string }>;
  onLinkDelete: (linkId: string) => Promise<{ ok: boolean; message?: string }>;
  onDescriptionChange: (
    newDescription: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onAddQuestion: () => Promise<{ ok: boolean; message?: string }>;
  onQuestionChange: (
    newQuestion: QuestionPrompt
  ) => Promise<{ ok: boolean; message?: string }>;
  onQuestionDelete: (
    questionId: string
  ) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [description, setDescription] = useState(project.description);


  return (
    <div>
      <div className="flex w-full space-x-4">
        <div className="w-1/2">
          <h1 className="text-xl font-bold text-primary w-full border-b border-primary">
            Project Thumbnail: What makes your project stand out?
          </h1>
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
        <div className="w-1/2">
          <h1 className="text-xl font-bold text-primary w-full border-b border-primary">
            A picture is worth a thousand words, add them here.
          </h1>
          <MultiImageUpload
            images={project.images}
            storageRemaining={project.storageRemaining}
            onUpload={onAddImage}
            onAltChange={onImageCaptionChange}
            onDelete={onImageDelete}
            onLink={onAddImage}
          />
        </div>
      </div>
      <div className="flex w-full space-x-4 my-4">
        <div className="w-1/2">
          <h1 className="text-xl font-bold text-primary w-full border-b border-primary mb-1">
            Are there any relevant links to include?
          </h1>
          {project.links.map((link) => (
            <div
              key={link.id}
              className="flex w-full space-x-2 space-y-2 mb-1 pb-1 flex-wrap border-b border-primary"
            >
              <BeyondLineEdit
                value={link.link}
                onChange={(value) => {
                  onLinkChange({ ...link, link: value });
                }}
                placeholder="Link URL"
              />
              <BeyondLineEdit
                value={link.coverText}
                onChange={(value) => {
                  onLinkChange({ ...link, coverText: value });
                }}
                placeholder="Link Cover Text"
              />
              <BeyondButton
                onClick={() => onLinkDelete(link.id)}
                className="h-8 flex items-center"
              >
                Delete Link
              </BeyondButton>
            </div>
          ))}
          <BeyondButton onClick={onAddLink} className="h-8 flex items-center">
            Add Link
          </BeyondButton>
        </div>
        <div className="w-1/2">
          <h1 className="text-xl font-bold text-primary w-full border-b border-primary">
            What skills did you use in this project?
          </h1>
          <TagSelector
            availableTags={availableSkillTags}
            onTagSelect={onAddSkillTag}
            onTagDeselect={onRemoveSkillTag}
            onCreateTag={onCreateSkillTag}
            existingTags={project.skillTags}
            allowTagCreation={true}
          />
        </div>
      </div>
      <h1 className="text-xl font-bold text-primary w-full border-b border-primary">
        Tell us about your project, the more detail the better.
      </h1>
      <RichTextEditor
        onChange={setDescription}
        content={description}
        onBlur={() => onDescriptionChange(description)}
      />
      <h1 className="text-xl font-bold text-primary w-full border-b border-primary pt-4">
        Elaborate further: What did you learn, what challenges did you face, and
        what would you do differently?
      </h1>
      {project.questions.map((question) => (
        <QuestionInput
          key={question.id}
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
      <BeyondButton onClick={onAddQuestion} className="h-8 flex items-center">
        Add Question
      </BeyondButton>
    </div>
  );
}
