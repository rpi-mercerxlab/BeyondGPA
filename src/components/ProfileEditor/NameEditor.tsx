"use client";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";

export default function NameEditor() {
  return (
    <div className="w-full flex flex-col items-start">
      <label htmlFor="name" className="text-lg font-medium mb-2">
        Preferred First Name
      </label>
      <BeyondLineEdit
        onChange={() => {}}
        value=""
        placeholder="First Name"
        className="w-full max-w-xs mb-4 border-gray-900"
      />

      <label htmlFor="name" className="text-lg font-medium mb-2">
        Preferred Last Name
      </label>
      <BeyondLineEdit
        onChange={() => {}}
        value=""
        placeholder="Last Name"
        className="w-full max-w-xs mb-4 border-gray-900"
      />

      <label htmlFor="name" className="text-lg font-medium mb-2">
        Bio
      </label>
      {/* TODO: Need to implement length limit */}
      <BeyondLineEdit
        onChange={() => {}}
        value=""
        placeholder="A short bio about yourself"
        className="w-full max-w-xs mb-4 border-gray-900"
      />
    </div>
  );
}
