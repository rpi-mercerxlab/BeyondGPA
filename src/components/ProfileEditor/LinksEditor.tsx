"use client";

import { useState } from "react";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import { Link } from "@/types/user_profiles";
import BeyondButton from "../common/BeyondComponents/BeyondButton";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";

export default function LinksInput() {
	const [links, setLinks] = useState<Link[]>([]);

	return (
		<div className="w-full flex flex-col items-center ">
			<h2 className="text-lg font-semibold mb-2">Your Links:</h2>
			<div className="w-full max-h-80 overflow-y-auto">
				{links.map((link, index) => (
					<div key={index} className="flex items-center mb-2">
						<BeyondLineEdit
							placeholder="Link URL"
							value={link.url}
							onChange={(value) => {
								setLinks((prevLinks) => {
									prevLinks[index].url = value;
									return [...prevLinks];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mr-2"
						/>
						<BeyondLineEdit
							placeholder="Link Label"
							value={link.label}
							onChange={(value) => {
								setLinks((prevLinks) => {
									prevLinks[index].label = value;
									return [...prevLinks];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mr-2"
						/>
						<BeyondButton
							onClick={() => {
								const newLinks = links.filter((_, i) => i !== index);
								setLinks(newLinks);
							}}
						>
							Delete
						</BeyondButton>
					</div>
				))}
			</div>
			<BeyondButton onClick={() => setLinks([...links, { url: "", label: "" }])}>
				Add Link
			</BeyondButton>
		</div>
	);
}
