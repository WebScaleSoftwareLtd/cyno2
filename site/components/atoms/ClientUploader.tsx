"use client";

import { UploadButton, FileRouter } from "../external/uploadthing";

type Props = {
    value: string | null;
    onChange: (value: string) => void;
    endpoint: keyof FileRouter;
};

export default function ClientUploader({ value, onChange, endpoint }: Props) {
    return (
        <div className="flex">
            {
                value && <div className="flex-col mr-2">
                    <img
                        className="w-32 h-16 object-contain"
                        src={value}
                        alt="Current Image"
                    />
                </div>
            }

            <div className="flex-col">
                <UploadButton
                    endpoint={endpoint}
                    onClientUploadComplete={(res) => {
                        onChange(res[0].url);
                    }}
                />
            </div>
        </div>
    );
}
