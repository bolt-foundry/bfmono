import * as React from "react";
import { createPortal } from "react-dom";
import { fonts } from "@bfmono/apps/cfDs/const.tsx";
import { CfDsButton } from "@bfmono/apps/cfDs/components/CfDsButton.tsx";
import { classnames } from "@bfmono/lib/classnames.ts";
import { useClickOutside } from "@bfmono/packages/react-hooks/mod.ts";
import { useCfDs } from "@bfmono/apps/cfDs/hooks/useCfDs.tsx";

const { useEffect, useRef, useState, forwardRef, useImperativeHandle } = React;

export interface ModalHandles {
  closeModal: () => void;
}

type ModalOptions = {
  children: React.ReactNode;
  clickOusideToClose?: boolean;
  confirmClose?: boolean;
  header?: string;
  onClose?: () => void;
  onSave?: (() => void) | null;
  xstyle?: React.CSSProperties;
  contentXstyle?: React.CSSProperties;
  kind?: string;
};

const styles: Record<string, React.CSSProperties> = {
  close: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  content: {
    padding: 40,
    overflowY: "auto",
  },
  footer: {
    boxSizing: "border-box",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "var(--border)",
    padding: 24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    width: "100%",
  },
  header: {
    padding: "40px 80px 0 40px",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalBase: {
    fontFamily: fonts.fontFamily,
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modal: {
    background: "var(--background)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.06)",
    maxHeight: "90%",
    display: "flex",
    flexDirection: "column",
  },
};

export const CfDsModal = forwardRef<ModalHandles, ModalOptions>(
  (
    {
      children,
      clickOusideToClose = true,
      confirmClose,
      header,
      onClose,
      onSave,
      xstyle,
      contentXstyle,
      // kind,
    }: ModalOptions,
    ref: React.ForwardedRef<ModalHandles>,
  ) => {
    const [show, setShow] = useState(false);
    const [inDom, setInDom] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    let domTimer: number;

    useEffect(() => {
      clearTimeout(domTimer);
      setInDom(true);
      setTimeout(() => setShow(true), 0);
    }, []);

    const close = () => {
      setShow(false);
      domTimer = setTimeout(() => {
        onClose?.();
      }, 250);
    };

    useClickOutside(modalRef, close, {
      isActive: clickOusideToClose,
      showConfirmation: confirmClose,
      excludeElementIds: ["tooltip-root"],
      portal: "modal-root",
    });

    useImperativeHandle(ref, () => ({
      closeModal() {
        if (!ref) return;
        handleClose();
      },
    }));

    const handleClose = () => {
      if (confirmClose) {
        const result = confirm(
          "You have unsaved changes. Close without saving?",
        );
        if (result) {
          close();
        }
      } else {
        close();
      }
    };

    const modalClasses = classnames([
      "modalBase",
      { show },
    ]);

    return inDom
      ? createPortal(
        <div
          className={modalClasses}
          style={styles.modalBase}
        >
          <div
            className="modal"
            ref={modalRef}
            style={{ ...styles.modal, ...xstyle }}
          >
            {header != null && (
              <div style={styles.header}>
                {header}
              </div>
            )}
            {onClose != null && (
              <div style={styles.close}>
                <CfDsButton
                  iconLeft="cross"
                  kind="overlay"
                  onClick={() => {
                    handleClose();
                  }}
                  testId="button-close-modal"
                />
              </div>
            )}
            <div style={{ ...styles.content, ...contentXstyle }}>
              {children}
            </div>
            {onSave != null && (
              <div style={styles.footer}>
                <CfDsButton text="Cancel" kind="outline" onClick={onClose} />
                <CfDsButton text="Save" kind="primary" onClick={onSave} />
              </div>
            )}
          </div>
        </div>,
        document.getElementById("modal-root") as Element,
      )
      : null;
  },
);

export function Example() {
  const { showModal } = useCfDs();
  return (
    <CfDsButton
      text="Show modal"
      onClick={() => showModal(<div>Example modal</div>)}
    />
  );
}
