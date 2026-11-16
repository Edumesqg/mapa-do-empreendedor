'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type MeetingControlsProps = {
  disabled?: boolean;
  onRevise: (notes: string) => void;
  onFollow: () => void;
  followLabel?: string;
  reviseLabel?: string;
  showAdjustmentActions?: boolean;
  hasPendingAdjustment?: boolean;
  onAcceptAdjustment?: () => void;
  onSkipAdjustment?: () => void;
};

export function MeetingControls({
  disabled,
  onRevise,
  onFollow,
  followLabel = 'Seguir para o próximo passo',
  reviseLabel = 'Revisar esta entrega',
  showAdjustmentActions,
  hasPendingAdjustment,
  onAcceptAdjustment,
  onSkipAdjustment,
}: MeetingControlsProps) {
  const [revising, setRevising] = useState(false);
  const [notes, setNotes] = useState('');

  const submitRevise = (event: FormEvent) => {
    event.preventDefault();
    const text = notes.trim();
    if (!text || disabled) return;
    onRevise(text);
    setNotes('');
    setRevising(false);
  };

  if (revising) {
    return (
      <form onSubmit={submitRevise} className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="text-sm font-medium text-amber-950">O que deve mudar nesta entrega?</p>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Ex.: isso não é força, é desejo; não invente oportunidade digital..."
          className="min-h-[72px] bg-white"
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={disabled || !notes.trim()} className="bg-amber-700 text-white hover:bg-amber-800">
            Regenerar entrega
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setRevising(false);
              setNotes('');
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  }

  if (showAdjustmentActions) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {hasPendingAdjustment && onAcceptAdjustment && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onAcceptAdjustment}
            className="bg-emerald-green text-white hover:bg-emerald-600"
          >
            Aceitar ajuste na SWOT
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setRevising(true)}
          className="border-slate-300 bg-white"
        >
          Revisar sugestão
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={onSkipAdjustment || onFollow}
          className="border-slate-300 bg-white"
        >
          Seguir sem alterar
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setRevising(true)}
        className="border-slate-300 bg-white"
      >
        {reviseLabel}
      </Button>
      <Button type="button" disabled={disabled} onClick={onFollow} className="bg-emerald-green text-white hover:bg-emerald-600">
        {followLabel}
      </Button>
    </div>
  );
}
