(() => {
    const forms = document.querySelectorAll(".inquiry-form");
    if (!forms.length) return;

    const SUBMISSION_COOLDOWN_MS = 10 * 60 * 1000;
    const LAST_SUBMISSION_KEY = "dongminInquiryLastSubmittedAt";
    const ERROR_TITLE = "전송이 원활하지 않습니다.";
    const ERROR_MESSAGE = "대표전화 또는 이메일로 문의해 주세요.";

    function readLastSubmissionTime() {
        try {
            return Number.parseInt(localStorage.getItem(LAST_SUBMISSION_KEY) || "0", 10) || 0;
        } catch {
            return 0;
        }
    }

    function rememberSubmissionTime() {
        try {
            localStorage.setItem(LAST_SUBMISSION_KEY, String(Date.now()));
        } catch {
            // Storage can be unavailable in private or restricted browser modes.
        }
    }

    function isCooldownActive() {
        const lastSubmissionTime = readLastSubmissionTime();
        return lastSubmissionTime > 0 && Date.now() - lastSubmissionTime < SUBMISSION_COOLDOWN_MS;
    }

    function setStatus(status, type, title, message) {
        status.hidden = false;
        status.className = `form-status is-${type}`;
        status.replaceChildren();

        const titleElement = document.createElement("strong");
        titleElement.textContent = title;

        const messageElement = document.createElement("p");
        messageElement.textContent = message;

        status.append(titleElement, messageElement);

        if (type === "success") {
            const resetButton = document.createElement("button");
            resetButton.type = "button";
            resetButton.textContent = "다시 작성하기";
            resetButton.addEventListener("click", () => {
                const form = status.closest(".inquiry-form");
                form?.classList.remove("is-complete");
                status.hidden = true;
                status.replaceChildren();
                form?.querySelector("input:not([tabindex='-1']), textarea")?.focus();
            });
            status.append(resetButton);
        }
    }

    function showGenericFailure(status) {
        setStatus(status, "error", ERROR_TITLE, ERROR_MESSAGE);
        status.focus({ preventScroll: true });
    }

    forms.forEach((form) => {
        const submitButton = form.querySelector("button[type='submit']");
        const originalButtonText = submitButton?.textContent || "상담 요청하기";
        const status = document.createElement("div");

        status.className = "form-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        status.tabIndex = -1;
        status.hidden = true;
        form.append(status);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (form.classList.contains("is-sending")) return;

            const honeypot = form.querySelector("input[name='_gotcha']");
            if (honeypot?.value.trim() || isCooldownActive()) {
                showGenericFailure(status);
                return;
            }

            form.classList.remove("is-complete");
            form.classList.add("is-sending");
            setStatus(status, "sending", "문의 내용을 보내는 중입니다.", "잠시만 기다려 주세요.");

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "전송 중";
            }

            try {
                const response = await fetch(form.action, {
                    method: form.method || "POST",
                    body: new FormData(form),
                    headers: {
                        Accept: "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Form submission failed");
                }

                rememberSubmissionTime();
                form.reset();
                form.classList.add("is-complete");
                setStatus(status, "success", "문의가 접수되었습니다.", "확인 후 연락드리겠습니다.");
                status.focus({ preventScroll: true });
            } catch {
                showGenericFailure(status);
            } finally {
                form.classList.remove("is-sending");

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }
        });
    });
})();
