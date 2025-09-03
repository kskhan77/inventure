/**
 * Recruiting Without Limits - Main JavaScript File
 * Handles AI-powered job description and interview question generation
 */

// DOM Element References
const elements = {
    generateDescBtn: null,
    generateQuestionsBtn: null,
    generateResponsibilitiesBtn: null,
    jobTitleInput: null,
    jobSkillsInput: null,
    modal: null,
    modalContentEl: null,
    modalTitleEl: null,
    modalBody: null,
    loadingSpinner: null,
    closeModalBtn: null,
    helpBtn: null,
    helpModal: null,
    closeHelpBtn: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
});

/**
 * Initialize DOM element references
 */
function initializeElements() {
    elements.generateDescBtn = document.getElementById('generateDescBtn');
    elements.generateQuestionsBtn = document.getElementById('generateQuestionsBtn');
    elements.generateResponsibilitiesBtn = document.getElementById('generateResponsibilitiesBtn');
    elements.jobTitleInput = document.getElementById('jobTitle');
    elements.jobSkillsInput = document.getElementById('jobSkills');
    elements.modal = document.getElementById('aiModal');
    elements.modalContentEl = document.getElementById('modalContent');
    elements.modalTitleEl = document.getElementById('modalTitle');
    elements.modalBody = document.getElementById('modalBody');
    elements.loadingSpinner = document.getElementById('loadingSpinner');
    elements.closeModalBtn = document.getElementById('closeModalBtn');
    elements.helpBtn = document.getElementById('helpBtn');
    elements.helpModal = document.getElementById('helpModal');
    elements.closeHelpBtn = document.getElementById('closeHelpBtn');
}

/**
 * Setup event listeners for all interactive elements
 */
function setupEventListeners() {
    // Button event listeners
    if (elements.generateDescBtn) {
        elements.generateDescBtn.addEventListener('click', () => handleGenerate('description'));
    }
    
    if (elements.generateQuestionsBtn) {
        elements.generateQuestionsBtn.addEventListener('click', () => handleGenerate('questions'));
    }
    
    if (elements.generateResponsibilitiesBtn) {
        elements.generateResponsibilitiesBtn.addEventListener('click', () => handleGenerate('responsibilities'));
    }
    
    // Modal event listeners
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', hideModal);
    }
    
    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                hideModal();
            }
        });
    }
    
    // Help modal event listeners
    if (elements.helpBtn) {
        elements.helpBtn.addEventListener('click', showHelpModal);
    }
    
    if (elements.closeHelpBtn) {
        elements.closeHelpBtn.addEventListener('click', hideHelpModal);
    }
    
    if (elements.helpModal) {
        elements.helpModal.addEventListener('click', (e) => {
            if (e.target === elements.helpModal) {
                hideHelpModal();
            }
        });
    }
    
    // Keyboard event listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!elements.modal.classList.contains('hidden')) {
                hideModal();
            } else if (!elements.helpModal.classList.contains('hidden')) {
                hideHelpModal();
            }
        }
    });
    
    // Form validation on input
    if (elements.jobTitleInput && elements.jobSkillsInput) {
        elements.jobTitleInput.addEventListener('input', validateForm);
        elements.jobSkillsInput.addEventListener('input', validateForm);
    }
}

/**
 * Validate form inputs and update button states
 */
function validateForm() {
    const jobTitle = elements.jobTitleInput.value.trim();
    const jobSkills = elements.jobSkillsInput.value.trim();
    const isValid = jobTitle && jobSkills;
    
    // Update button states
    if (elements.generateDescBtn) {
        elements.generateDescBtn.disabled = !isValid;
        elements.generateDescBtn.classList.toggle('opacity-50', !isValid);
        elements.generateDescBtn.classList.toggle('cursor-not-allowed', !isValid);
    }
    
    if (elements.generateQuestionsBtn) {
        elements.generateQuestionsBtn.disabled = !isValid;
        elements.generateQuestionsBtn.classList.toggle('opacity-50', !isValid);
        elements.generateQuestionsBtn.classList.toggle('cursor-not-allowed', !isValid);
    }
    
    if (elements.generateResponsibilitiesBtn) {
        elements.generateResponsibilitiesBtn.disabled = !isValid;
        elements.generateResponsibilitiesBtn.classList.toggle('opacity-50', !isValid);
        elements.generateResponsibilitiesBtn.classList.toggle('cursor-not-allowed', !isValid);
    }
}

/**
 * Show the modal with loading state
 */
function showModal() {
    if (!elements.modal) return;
    
    // Reset modal content
    elements.modalContentEl.innerHTML = '';
    elements.modalContentEl.classList.add('hidden');
    elements.loadingSpinner.style.display = 'flex';
    
    // Show modal
    elements.modal.classList.remove('hidden');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the modal with animation
 */
function hideModal() {
    if (!elements.modal) return;
    
    elements.modal.classList.remove('modal-enter-active');
    elements.modal.classList.add('modal-leave-active');
    
    const modalContent = elements.modal.querySelector('.bg-white');
    if (modalContent) {
        modalContent.classList.remove('modal-content-enter-active');
        modalContent.classList.add('modal-content-leave-active');
    }
    
    // Hide modal after animation
    setTimeout(() => {
        elements.modal.classList.add('hidden');
        elements.modal.classList.remove('modal-leave-active');
        
        if (modalContent) {
            modalContent.classList.remove('modal-content-leave-active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }, 300);
}

/**
 * Show the help modal
 */
function showHelpModal() {
    if (!elements.helpModal) return;
    
    elements.helpModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the help modal
 */
function hideHelpModal() {
    if (!elements.helpModal) return;
    
    elements.helpModal.classList.add('hidden');
    document.body.style.overflow = '';
}



/**
 * Call Gemini API with retry logic and exponential backoff
 * @param {string} prompt - The prompt to send to the API
 * @param {number} retries - Number of retries remaining
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<string>} - The generated content
 */
async function callGeminiAPI(prompt, retries = 3, delay = 1000) {
    const apiKey = "AIzaSyCp42Se90Lh3HuSQ16ahVJ0mv-M_1HwSNQ";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                console.warn(`Rate limited. Retrying in ${delay / 1000}s... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return callGeminiAPI(prompt, retries - 1, delay * 2); // Exponential backoff
            }
            throw new Error(`API error: ${response.statusText} (Status: ${response.status})`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];
        
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        } else {
            console.error("Unexpected API response structure:", result);
            return "Error: Could not extract text from the API response.";
        }
    } catch (error) {
        console.error('Fetch error:', error);
        
        if (retries > 0) {
            console.warn(`Fetch failed. Retrying in ${delay / 1000}s... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callGeminiAPI(prompt, retries - 1, delay * 2);
        }
        
        return `An error occurred: ${error.message}. Please check the console for more details.`;
    }
}

/**
 * Convert Markdown to HTML with improved formatting
 * @param {string} markdown - The markdown text to convert
 * @returns {string} - The converted HTML
 */
function markdownToHTML(markdown) {
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-10 mb-5 text-gray-900">$1</h1>')
        
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        
        // Italic text
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        
        // List items
        .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-2 text-gray-700">$1</li>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2 text-gray-700">$1</li>')
        
        // Line breaks
        .replace(/\n/g, '<br>');

    // Wrap list items in ul tags
    if (html.includes('<li')) {
        html = html.replace(/(<li.*?<\/li>(?:<br>)*)+/g, (match) => {
            const cleanMatch = match.replace(/<br>/g, '').replace(/<\/li><li/g, '</li><li');
            return `<ul class="list-disc list-inside mb-4 space-y-1">${cleanMatch}</ul>`;
        });
    }

    // Clean up extra breaks
    html = html
        .replace(/<br><ul>/g, '<ul>')
        .replace(/<\/ul><br>/g, '</ul>')
        .replace(/<br><h/g, '<h')
        .replace(/<\/h[1-6]><br>/g, (match) => match.replace('<br>', ''));

    return html;
}

/**
 * Generate AI content based on type
 * @param {string} type - Either 'description', 'responsibilities', or 'questions'
 */
async function handleGenerate(type) {
    const jobTitle = elements.jobTitleInput.value.trim();
    const jobSkills = elements.jobSkillsInput.value.trim();

    // Validation
    if (!jobTitle || !jobSkills) {
        alert('Please fill in both the Job Title and Skills fields.');
        return;
    }

    // Show modal and loading state
    showModal();
    
    let prompt = '';

                if (type === 'description') {
                elements.modalTitleEl.textContent = `Job Description for ${jobTitle}`;
                prompt = `You are an expert recruiter. Write a compelling and professional job description for the role of '${jobTitle}'. 

Key responsibilities and skills: '${jobSkills}'

The description should be:
- Engaging and professional
- Clearly outline the role and expectations
- Include qualifications and requirements
- Mention what the company offers
- Be structured and easy to read

Format the response in Markdown with clear headings like:
- Role Overview
- Key Responsibilities  
- Qualifications & Requirements
- What We Offer

Keep it concise but comprehensive.`;
            } else if (type === 'responsibilities') {
                elements.modalTitleEl.textContent = `Key Responsibilities for ${jobTitle}`;
                prompt = `You are an expert recruiter and job analyst. Generate a comprehensive list of key responsibilities for the role of '${jobTitle}'. 

Based on the skills and requirements: '${jobSkills}'

Create 8-12 specific, actionable responsibilities that:
- Are clearly defined and measurable
- Align with the role level and industry standards
- Cover both daily tasks and strategic objectives
- Include collaboration and communication aspects
- Are realistic and achievable

Format the response as a Markdown bulleted list with brief explanations for each responsibility.

Make sure each responsibility starts with an action verb and is specific to this role.`;
            } else {
                elements.modalTitleEl.textContent = `Interview Questions for ${jobTitle}`;
                prompt = `You are a senior hiring manager. Generate 10 insightful interview questions for the role of '${jobTitle}'. 

Key skills for this role: '${jobSkills}'

Include a mix of:
- Behavioral questions (3-4 questions)
- Technical/skill-based questions (4-5 questions) 
- Situational questions (2-3 questions)

Format the response as a Markdown list with brief explanations of what each question aims to assess.

Make the questions specific to the role and skills mentioned.`;
            }

    try {
        const resultText = await callGeminiAPI(prompt);
        const htmlContent = markdownToHTML(resultText);

        // Display the content
        elements.modalContentEl.innerHTML = htmlContent;
        elements.loadingSpinner.style.display = 'none';
        elements.modalContentEl.classList.remove('hidden');
        
        // Add copy button
        addCopyButton();
        
    } catch (error) {
        console.error('Error generating content:', error);
        elements.modalContentEl.innerHTML = `
            <div class="text-center py-8">
                <div class="text-red-500 mb-4">
                    <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                <p class="text-gray-600">Unable to generate content. Please try again later.</p>
            </div>
        `;
        elements.loadingSpinner.style.display = 'none';
        elements.modalContentEl.classList.remove('hidden');
    }
}

/**
 * Add copy button to modal content
 */
function addCopyButton() {
    const copyButton = document.createElement('button');
    copyButton.className = 'mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2';
    copyButton.innerHTML = `
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy to Clipboard
    `;
    
    copyButton.addEventListener('click', async () => {
        try {
            const textContent = elements.modalContentEl.innerText;
            await navigator.clipboard.writeText(textContent);
            
            copyButton.innerHTML = `
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
            `;
            
            setTimeout(() => {
                copyButton.innerHTML = `
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                `;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy text:', error);
            showNotification('Failed to copy to clipboard', 'error');
        }
    });
    
    elements.modalContentEl.appendChild(copyButton);
}

/**
 * Show notification message
 * @param {string} message - The message to show
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 
                   type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
                   'bg-blue-100 border-blue-400 text-blue-700';
    
    notification.className = `fixed top-4 right-4 ${bgColor} px-4 py-3 rounded border z-50 shadow-lg transition-all duration-300 transform translate-x-full`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.remove('translate-x-full');
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

/**
 * Initialize form validation on page load
 */
function initializeFormValidation() {
    validateForm();
}

// Export functions for potential external use
window.RecruitingApp = {
    showModal,
    hideModal,
    handleGenerate,
    showNotification
};
