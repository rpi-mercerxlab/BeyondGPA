"use client";

import { useState } from "react";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import SingleImageUpload from "../common/SingleImageUpload";


export default function ProfilePictureEditor() {

	return (
		<div className="w-full flex flex-col items-center">
			<div className="w-32 h-32 rounded-full bg-gray-300 mb-4"></div>
			<div className="w-full">
				
				<SingleImageUpload
					className="w-full bg-bg-base-200"
					onAltChange={async () => {
						return { ok: true };
					}}
					onDelete={async () => {
						return { ok: true };
					}}
					onUpload={async () => {
						return { ok: true, url: "https://via.placeholder.com/150" };
					}}
					onUrlChange={async () => {
						return { ok: true };
					}}
					storageRemaining={1000000}
				/>
			</div>
			
		</div>
	);
}
