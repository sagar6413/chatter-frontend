"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FaTimes } from "react-icons/fa";

interface CreateNewGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: {
    groupName: string;
    description?: string;
    participants: string[];
    avatar?: string;
  }) => void;
}

export function CreateNewGroup({
  isOpen,
  onClose,
  onCreateGroup,
}: CreateNewGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(false);
  const [maxMembers, setMaxMembers] = useState(100);
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (participants.size < 2) {
      setError("At least 2 participants are required");
      return;
    }

    try {
      onCreateGroup({
        groupName: groupName.trim(),
        description: description.trim(),
        participants: Array.from(participants),
      });

      // Reset form
      setGroupName("");
      setDescription("");
      setIsPublic(false);
      setOnlyAdminsCanSend(false);
      setMaxMembers(100);
      setParticipants(new Set());
      setError(null);
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full flex-col border border-purple-500/20 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden">
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-purple-500/10 text-purple-400 hover:text-purple-200 rounded-xl"
          >
            <FaTimes className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Create New Group
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="p-4 bg-red-900/20 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="groupName">Group Name</Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            className="bg-slate-800/50 border-purple-500/20 focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 text-purple-100"
            placeholder="Enter group name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800/50 border-purple-500/20 focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 text-purple-100"
            placeholder="Enter group description (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxMembers">Maximum Members</Label>
          <Input
            id="maxMembers"
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            min={2}
            max={1000}
            className="bg-slate-800/50 border-purple-500/20 focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 text-purple-100"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isPublic">Public Group</Label>
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="onlyAdminsCanSend">
            Only Admins Can Send Messages
          </Label>
          <Switch
            id="onlyAdminsCanSend"
            checked={onlyAdminsCanSend}
            onCheckedChange={setOnlyAdminsCanSend}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!groupName.trim()}
        >
          Create Group
        </Button>
      </form>
    </div>
  );
}
