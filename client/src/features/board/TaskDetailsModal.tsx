"use client";

import { useEffect, useRef } from "react";
import { priorityStyles } from "./TaskCard";
import type { BoardTask } from "./types"

type TaskDetailsModalProps = {
    task: BoardTask;
    onClose: () => void;
}

export function TaskDetailsModal({ task, onClose }: TaskDetailsModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!dialogRef.current) {
            return;
        }

        dialogRef.current.showModal();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90vh] 
            overflow-y-auto rounded-xl bg-white p-6 shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        >
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                    <h3 className="text-lg font-semibold text-zinc-900">Task Details</h3>
                    <button
                        type="button"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md 
                        text-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-500"
                        onClick={() => onClose()}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium tracking-wide text-zinc-500">
                            TITLE
                        </p>
                        <h2 className="break-words text-xl font-semibold text-zinc-900">
                            {task.title}
                        </h2>
                    </div>

                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium tracking-wide text-zinc-500">
                            DESCRIPTION
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm text-zinc-700">
                            {task.description || "None"}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex flex-col items-start gap-1">
                            <p className="text-xs font-medium tracking-wide text-zinc-500">
                                PRIORITY
                            </p>
                            <span className={`rounded-md px-2 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
                                {task.priority}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium tracking-wide text-zinc-500">
                                DUE DATE
                            </p>
                            <p className="text-sm text-zinc-700">
                                {task.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString("uk-UA")
                                    : "None"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    )
}