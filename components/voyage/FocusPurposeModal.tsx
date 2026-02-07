"use client";

import { useState } from "react";
import { FOCUS_PURPOSES, type FocusPurpose } from "@/lib/focusPurposes";
import { Modal, Button, Input } from "@/components/ui";

interface FocusPurposeModalProps {
  isOpen: boolean;
  cabinNumber: string | null;
  onSelect: (purpose: FocusPurpose, customText?: string) => void;
  onClose: () => void;
}

export function FocusPurposeModal({
  isOpen,
  cabinNumber,
  onSelect,
  onClose,
}: FocusPurposeModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const handleConfirm = () => {
    const purpose = FOCUS_PURPOSES.find((p) => p.id === selected);
    if (purpose) {
      onSelect(purpose, selected === "custom" ? customText : undefined);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <Modal.Header>
        {cabinNumber && (
          <p className="text-xs text-blue-400 mb-1">Cabin: {cabinNumber}</p>
        )}
        <h2 className="text-xl font-bold text-white">
          무엇에 집중하시겠어요?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          항해 목적을 선택해주세요
        </p>
      </Modal.Header>

      <Modal.Body>
        <div className="grid grid-cols-3 gap-3">
          {FOCUS_PURPOSES.map((purpose) => {
            const Icon = purpose.icon;
            const isSelected = selected === purpose.id;

            return (
              <button
                key={purpose.id}
                onClick={() => setSelected(purpose.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? `border-cyan-400 ${purpose.bgColor}`
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }
                `}
              >
                <Icon
                  className={`w-7 h-7 mx-auto mb-2 ${
                    isSelected ? purpose.color : "text-white/70"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-white/70"
                  }`}
                >
                  {purpose.labelKo}
                </p>
              </button>
            );
          })}
        </div>

        {selected === "custom" && (
          <div className="mt-4">
            <Input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="집중 목표를 입력하세요"
              maxLength={20}
            />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} fullWidth>
          취소
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!selected || (selected === "custom" && !customText.trim())}
          fullWidth
        >
          다음
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
