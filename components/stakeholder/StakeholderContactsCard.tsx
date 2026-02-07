'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, Check, X, Loader2, Pencil } from 'lucide-react';

interface StakeholderContact {
  id: string;
  name: string;
  role: string;
  roleOther: string;
  department: string;
  jobTitle: string;
  email: string;
  notes: string;
}

const ROLE_OPTIONS = [
  'Executive Sponsor',
  'Department Manager',
  'Subject Matter Expert',
  'Project Manager',
  'Other',
];

function generateId(): string {
  return crypto.randomUUID();
}

const emptyContact = (): StakeholderContact => ({
  id: generateId(),
  name: '',
  role: 'Executive Sponsor',
  roleOther: '',
  department: '',
  jobTitle: '',
  email: '',
  notes: '',
});

function displayRole(contact: StakeholderContact): string {
  return contact.role === 'Other' && contact.roleOther
    ? contact.roleOther
    : contact.role;
}

export default function StakeholderContactsCard({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [contacts, setContacts] = useState<StakeholderContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addingNew, setAddingNew] = useState(false);
  const [draft, setDraft] = useState<StakeholderContact>(emptyContact());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<StakeholderContact>(emptyContact());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/stakeholders`
      );
      if (res.ok) {
        setContacts(await res.json());
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const saveContacts = async (updated: StakeholderContact[]): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/stakeholders`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stakeholders: updated }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || `Save failed (${res.status})`;
        console.error('[StakeholderContactsCard] PUT failed:', res.status, msg);
        setError(msg);
        return false;
      }
      setContacts(await res.json());
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      console.error('[StakeholderContactsCard] PUT error:', msg);
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const trimContact = (c: StakeholderContact): StakeholderContact => ({
    ...c,
    name: c.name.trim(),
    roleOther: c.role === 'Other' ? c.roleOther.trim() : '',
    department: c.department.trim(),
    jobTitle: c.jobTitle.trim(),
    email: c.email.trim(),
    notes: c.notes.trim(),
  });

  const handleAddSave = async () => {
    if (!draft.name.trim()) return;
    const ok = await saveContacts([...contacts, trimContact(draft)]);
    if (ok) {
      setDraft(emptyContact());
      setAddingNew(false);
    }
  };

  const handleAddCancel = () => {
    setDraft(emptyContact());
    setAddingNew(false);
  };

  const handleEditStart = (contact: StakeholderContact) => {
    setEditingId(contact.id);
    setEditDraft({ ...contact });
    setAddingNew(false);
    setConfirmDeleteId(null);
  };

  const handleEditSave = async () => {
    if (!editDraft.name.trim()) return;
    const updated = contacts.map((c) =>
      c.id === editingId ? trimContact(editDraft) : c
    );
    const ok = await saveContacts(updated);
    if (ok) {
      setEditingId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await saveContacts(contacts.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="text-base font-semibold text-gray-900">
            Stakeholders
          </h3>
        </div>
        {saving && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Contact list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 && !addingNew ? (
        <p className="text-sm text-gray-500 mb-4">
          No stakeholders added yet
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {contacts.map((contact) =>
            editingId === contact.id ? (
              <InlineForm
                key={contact.id}
                value={editDraft}
                onChange={setEditDraft}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
                saving={saving}
              />
            ) : (
              <div
                key={contact.id}
                className="flex items-start justify-between py-2 px-3 rounded-lg hover:bg-gray-50 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {contact.name}
                    </span>
                    <span className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {displayRole(contact)}
                    </span>
                  </div>
                  {(contact.jobTitle || contact.department) && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {[contact.jobTitle, contact.department]
                        .filter(Boolean)
                        .join(' \u00B7 ')}
                    </p>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                  <button
                    onClick={() => handleEditStart(contact)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {confirmDeleteId === contact.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-1 text-red-600 hover:text-red-700 rounded"
                        title="Confirm delete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(contact.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {addingNew && (
            <InlineForm
              value={draft}
              onChange={setDraft}
              onSave={handleAddSave}
              onCancel={handleAddCancel}
              saving={saving}
            />
          )}
        </div>
      )}

      {/* Add button */}
      {!addingNew && editingId === null && (
        <button
          onClick={() => {
            setAddingNew(true);
            setConfirmDeleteId(null);
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      )}
    </div>
  );
}

function InlineForm({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  value: StakeholderContact;
  onChange: (v: StakeholderContact) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
      {/* Row 1: Name + Role */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          className="px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
          disabled={saving}
        />
        <div className="flex gap-2">
          <select
            value={value.role}
            onChange={(e) =>
              onChange({ ...value, role: e.target.value, roleOther: e.target.value !== 'Other' ? '' : value.roleOther })
            }
            className={`px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              value.role === 'Other' ? 'w-1/2' : 'w-full'
            }`}
            disabled={saving}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {value.role === 'Other' && (
            <input
              type="text"
              placeholder="Describe role"
              value={value.roleOther}
              onChange={(e) => onChange({ ...value, roleOther: e.target.value })}
              className="w-1/2 px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={saving}
            />
          )}
        </div>
      </div>
      {/* Row 2: Job Title + Department */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Job Title"
          value={value.jobTitle}
          onChange={(e) => onChange({ ...value, jobTitle: e.target.value })}
          className="px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving}
        />
        <input
          type="text"
          placeholder="Department"
          value={value.department}
          onChange={(e) => onChange({ ...value, department: e.target.value })}
          className="px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving}
        />
      </div>
      {/* Row 3: Email */}
      <input
        type="email"
        placeholder="Email"
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={saving}
      />
      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!value.name.trim() || saving}
          className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  );
}
