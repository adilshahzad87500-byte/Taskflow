/**
 * ====================================================================
 * TASKFLOW - MODERN PRODUCTIVITY & TASK MANAGEMENT APPLICATION
 * Clean Vanilla JavaScript Implementation with LocalStorage
 * ====================================================================
 */

// ==================== STATE MANAGEMENT ====================
let tasks = [];
let activeCategory = 'All';
let activeStatus = 'all';
let searchQuery = '';
let pendingDeleteId = null;
let currentModalSubtasks = [];

// LocalStorage Keys
const STORAGE_KEY_TASKS = 'taskflow_tasks';
const STORAGE_KEY_THEME = 'taskflow_theme';
const STORAGE_KEY_ONBOARDED = 'taskflow_onboarded';
const STORAGE_KEY_NOTIFS = 'taskflow_notifications';
const STORAGE_KEY_PROFILE = 'taskflow_user_profile';
const STORAGE_KEY_USERS = 'taskflow_users';
const STORAGE_KEY_CURRENT_USER = 'taskflow_current_user';

// User Accounts Storage Management
function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored users', e);
  }
  // Initialize default account for demo/immediate login
  const defaultUsers = [
    {
      id: 1,
      name: 'Muhammad Adil',
      emailOrPhone: 'es0155@taskflow.io',
      password: 'Password@123',
      role: 'Productivity Champion'
    }
  ];
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse current user', e);
  }
  return null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }
}

// User Profile Default State
const DEFAULT_PROFILE = {
  name: 'Muhammad Adil',
  username: '@es0155',
  email: 'es0155@taskflow.io',
  role: 'Productivity Champion',
  bio: 'Organize your thoughts, prioritize tasks, and execute effortlessly every single day.',
  avatarImg: null,
  presetAvatar: null
};

let userProfile = { ...DEFAULT_PROFILE };

// Default Sample Tasks for optional demo loading
const DEFAULT_TASKS = [
  {
    id: 1726300000001,
    title: "Finalize TaskFlow Interface Design",
    description: "Review mobile-first responsive layout, spacing, and micro-animations for launch.",
    category: "Product Design",
    priority: "High",
    dueDate: getTodayDateString(),
    dueTime: "16:00",
    completed: false,
    subtasks: [
      { id: 101, text: "Review competitor onboarding flows", completed: true },
      { id: 102, text: "Create wireframes & user journey", completed: true },
      { id: 103, text: "Finalize Figma design tokens", completed: false }
    ],
    createdAt: getTodayDateString()
  },
  {
    id: 1726300000002,
    title: "Weekly Grocery Shopping",
    description: "Pick up fresh fruits, vegetables, and almond milk from the local market.",
    category: "Shopping",
    priority: "Medium",
    dueDate: getTodayDateString(),
    dueTime: "18:30",
    completed: true,
    subtasks: [
      { id: 201, text: "Organic bananas & apples", completed: true },
      { id: 202, text: "Sourdough bread", completed: true }
    ],
    createdAt: getTodayDateString()
  },
  {
    id: 1726300000003,
    title: "Master Modern JavaScript Patterns",
    description: "Read Chapter 4 on asynchronous workflows and clean DOM architecture.",
    category: "Study",
    priority: "Medium",
    dueDate: getOffsetDateString(1),
    dueTime: "10:00",
    completed: false,
    subtasks: [
      { id: 301, text: "Complete exercise set A", completed: false },
      { id: 302, text: "Summarize core takeaways", completed: false }
    ],
    createdAt: getTodayDateString()
  },
  {
    id: 1726300000004,
    title: "Evening 5km Jog in the Park",
    description: "Stay hydrated and hit 30 minutes active cardio pace.",
    category: "Personal",
    priority: "Low",
    dueDate: getTodayDateString(),
    dueTime: "19:00",
    completed: false,
    subtasks: [],
    createdAt: getTodayDateString()
  }
];

// ==================== DOM ELEMENTS ====================
// Screens
const splashScreen = document.getElementById('splashScreen');
const onboardingScreen = document.getElementById('onboardingScreen');
const signupScreen = document.getElementById('signupScreen');
const signinScreen = document.getElementById('signinScreen');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const appShell = document.getElementById('appShell');

// Onboarding Elements (Image 1)
const skipOnboardingBtn = document.getElementById('skipOnboardingBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const goToSignInFromOnboarding = document.getElementById('goToSignInFromOnboarding');

// Sign Up Elements
const signupForm = document.getElementById('signupForm');
const signupNameInput = document.getElementById('signupNameInput');
const signupEmailOrPhoneInput = document.getElementById('signupEmailOrPhoneInput');
const signupPasswordInput = document.getElementById('signupPasswordInput');
const signupConfirmPasswordInput = document.getElementById('signupConfirmPasswordInput');
const submitSignupBtn = document.getElementById('submitSignupBtn');
const goToSignInBtn = document.getElementById('goToSignInBtn');
const signupAlert = document.getElementById('signupAlert');
const signupAlertText = document.getElementById('signupAlertText');
const signupAlertActionBtn = document.getElementById('signupAlertActionBtn');
const strengthBarFill = document.getElementById('strengthBarFill');
const strengthText = document.getElementById('strengthText');
const ruleLength = document.getElementById('ruleLength');
const ruleCase = document.getElementById('ruleCase');
const ruleNumber = document.getElementById('ruleNumber');
const ruleSpecial = document.getElementById('ruleSpecial');

// Sign In Elements
const signinForm = document.getElementById('signinForm');
const signinEmailOrPhoneInput = document.getElementById('signinEmailOrPhoneInput');
const signinPasswordInput = document.getElementById('signinPasswordInput');
const submitSigninBtn = document.getElementById('submitSigninBtn');
const goToSignUpBtn = document.getElementById('goToSignUpBtn');
const signinAlert = document.getElementById('signinAlert');
const signinAlertText = document.getElementById('signinAlertText');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const quickDemoLoginBtn = document.getElementById('quickDemoLoginBtn');

// Modern Segmented Tabs & Dedicated Auth Screen Elements
const tabGoToSignIn = document.getElementById('tabGoToSignIn');
const tabStaySignUp = document.getElementById('tabStaySignUp');
const tabStaySignIn = document.getElementById('tabStaySignIn');
const tabGoToSignUp = document.getElementById('tabGoToSignUp');
const signupQuickDemoBtn = document.getElementById('signupQuickDemoBtn');
const forgotPasswordScreen = document.getElementById('forgotPasswordScreen');
const backToSignInFromForgotBtn = document.getElementById('backToSignInFromForgotBtn');
const forgotGoToSignInBtn = document.getElementById('forgotGoToSignInBtn');
const authThemeToggleSignUp = document.getElementById('authThemeToggleSignUp');
const authThemeToggleSignIn = document.getElementById('authThemeToggleSignIn');
const authThemeToggleForgot = document.getElementById('authThemeToggleForgot');

// Forgot Password Modal / Screen Elements
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotEmailOrPhoneInput = document.getElementById('forgotEmailOrPhoneInput');
const forgotStep1Field = document.getElementById('forgotStep1Field');
const forgotOtpAndNewPassArea = document.getElementById('forgotOtpAndNewPassArea');
const forgotOtpInput = document.getElementById('forgotOtpInput');
const forgotNewPasswordInput = document.getElementById('forgotNewPasswordInput');
const forgotConfirmPasswordInput = document.getElementById('forgotConfirmPasswordInput');
const submitForgotBtn = document.getElementById('submitForgotBtn');
const cancelForgotBtn = document.getElementById('cancelForgotBtn');
const closeForgotModalBtn = document.getElementById('closeForgotModalBtn');
const forgotAlert = document.getElementById('forgotAlert');
const forgotAlertText = document.getElementById('forgotAlertText');
const generatedOtpDisplay = document.getElementById('generatedOtpDisplay');

// Account Sign Out Buttons
const settingsSignOutBtn = document.getElementById('settingsSignOutBtn');
const profileSignOutBtn = document.getElementById('profileSignOutBtn');

// Modern Header & Navigation Elements
const dynamicGreeting = document.getElementById('dynamicGreeting');
const headerBreadcrumbCurrent = document.getElementById('headerBreadcrumbCurrent');
const headerContextTitle = document.getElementById('headerContextTitle');
const headerContextSubtitle = document.getElementById('headerContextSubtitle');
const mobileHeaderViewPill = document.getElementById('mobileHeaderViewPill');
const headerSearchPill = document.getElementById('headerSearchPill');
const headerDateChip = document.getElementById('headerDateChip');
const dynamicDateBadge = document.getElementById('dynamicDateBadge');
const navThemeToggleBtn = document.getElementById('navThemeToggleBtn');
const notifBellBtn = document.getElementById('notifBellBtn');
const notifBadge = document.getElementById('notifBadge');
const notifDropdown = document.getElementById('notifDropdown');
const notifList = document.getElementById('notifList');
const clearNotifsBtn = document.getElementById('clearNotifsBtn');
const quickAddBtn = document.getElementById('quickAddBtn');

// User Quick Menu Dropdown Elements
const userNavDropdown = document.getElementById('userNavDropdown');
const dropdownProfileBtn = document.getElementById('dropdownProfileBtn');
const dropdownTasksBtn = document.getElementById('dropdownTasksBtn');
const dropdownSettingsBtn = document.getElementById('dropdownSettingsBtn');
const dropdownSignOutBtn = document.getElementById('dropdownSignOutBtn');

// Live Nav Badges
const sidebarTasksCount = document.getElementById('sidebarTasksCount');
const sidebarCatsCount = document.getElementById('sidebarCatsCount');
const mobileNavTasksBadge = document.getElementById('mobileNavTasksBadge');

// Dashboard Overview & Stats
const statTotal = document.getElementById('statTotal');
const statCompleted = document.getElementById('statCompleted');
const statPending = document.getElementById('statPending');
const statHigh = document.getElementById('statHigh');
const progressPercentage = document.getElementById('progressPercentage');
const progressBarFill = document.getElementById('progressBarFill');
const progressSubText = document.getElementById('progressSubText');

// Search & Filters
const taskSearchInput = document.getElementById('taskSearchInput');
const taskSearchInputSecondary = document.getElementById('taskSearchInputSecondary');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryPillsContainer = document.getElementById('categoryPillsContainer');
const statusFilterChips = document.querySelectorAll('.status-chip');
const currentListHeading = document.getElementById('currentListHeading');
const taskCountBadge = document.getElementById('taskCountBadge');

// Task Lists
const taskListContainer = document.getElementById('taskListContainer');
const tasksViewListContainer = document.getElementById('tasksViewListContainer');
const categoriesMatrix = document.getElementById('categoriesMatrix');

// Navigation
const bottomNav = document.querySelector('.bottom-nav');
const navItems = document.querySelectorAll('.nav-item');
const appViews = document.querySelectorAll('.app-view');
const mainFabBtn = document.getElementById('mainFabBtn');
const viewTasksAddBtn = document.getElementById('viewTasksAddBtn');

// Desktop Sidebar
const desktopSidebar = document.getElementById('desktopSidebar');
const sidebarQuickAddBtn = document.getElementById('sidebarQuickAddBtn');
const sidebarUserCard = document.getElementById('sidebarUserCard');
const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');

// User Profile Elements
const userAvatarBtn = document.getElementById('userAvatarBtn');
const avatarFileInput = document.getElementById('avatarFileInput');
const triggerUploadBtn = document.getElementById('triggerUploadBtn');
const removePhotoBtn = document.getElementById('removePhotoBtn');
const presetAvatarBtns = document.querySelectorAll('.preset-avatar-btn');
const profileForm = document.getElementById('profileForm');
const profileNameInput = document.getElementById('profileNameInput');
const profileUsernameInput = document.getElementById('profileUsernameInput');
const profileEmailInput = document.getElementById('profileEmailInput');
const profileRoleInput = document.getElementById('profileRoleInput');
const profileBioInput = document.getElementById('profileBioInput');

// Profile Productivity Stats Elements
const profileStatTotal = document.getElementById('profileStatTotal');
const profileStatCompleted = document.getElementById('profileStatCompleted');
const profileStatRate = document.getElementById('profileStatRate');
const profileStatStreak = document.getElementById('profileStatStreak');

// New Task Modal Elements (Image 2)
const taskModal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const newTaskBackBtn = document.getElementById('newTaskBackBtn');
const newTaskCancelBtn = document.getElementById('newTaskCancelBtn');
const taskForm = document.getElementById('taskForm');
const editTaskId = document.getElementById('editTaskId');
const taskTitleInput = document.getElementById('taskTitleInput');
const titleError = document.getElementById('titleError');
const taskDescInput = document.getElementById('taskDescInput');
const taskCategorySelect = document.getElementById('taskCategorySelect');
const taskDueDate = document.getElementById('taskDueDate');
const taskDueTime = document.getElementById('taskDueTime');
const pillDueToday = document.getElementById('pillDueToday');
const pillDueTomorrow = document.getElementById('pillDueTomorrow');
const pillDueCustom = document.getElementById('pillDueCustom');
const customDatePillText = document.getElementById('customDatePillText');
const dueDateStatusLabel = document.getElementById('dueDateStatusLabel');
const datePickerCard = document.getElementById('datePickerCard');
const timePickerCard = document.getElementById('timePickerCard');
const dateDisplayFormatted = document.getElementById('dateDisplayFormatted');
const timeDisplayFormatted = document.getElementById('timeDisplayFormatted');
const dateBadgeText = document.getElementById('dateBadgeText');
const timeBadgeText = document.getElementById('timeBadgeText');
const categorySelectedBadge = document.getElementById('categorySelectedBadge');
const timePresetBtns = document.querySelectorAll('.time-preset-btn');
const priorityBadgeIndicator = document.getElementById('priorityBadgeIndicator');
const prioritySegmentBtns = document.querySelectorAll('.priority-segment-btn');
const catChipBtns = document.querySelectorAll('.cat-chip-btn');
const subtasksCountBadge = document.getElementById('subtasksCountBadge');
const newSubtaskInput = document.getElementById('newSubtaskInput');
const addSubtaskBtn = document.getElementById('addSubtaskBtn');
const subtasksBuilderList = document.getElementById('subtasksBuilderList');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const saveTaskBtnText = document.getElementById('saveTaskBtnText');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Settings
const darkModeToggle = document.getElementById('darkModeToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllTasksBtn = document.getElementById('clearAllTasksBtn');
const loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
const relaunchOnboardingBtn = document.getElementById('relaunchOnboardingBtn');

// Toast
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

// ==================== DEADLINE REMINDER SYSTEM ====================
// Tracks which tasks we've already notified about so we don't repeat
const notifiedTaskIds = new Set();

/**
 * Checks all pending tasks and fires a notification if any task
 * is due within 1 hour from now.
 */
function checkDeadlineReminders() {
  const now = new Date();

  tasks.forEach(task => {
    if (task.completed) return;
    if (!task.dueDate || !task.dueTime) return;
    if (notifiedTaskIds.has(task.id)) return;

    // Build full due Date object
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes, 0);

    const diffMs = dueDate.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // Fire notification if task is due within 55-65 minutes (1 hour window)
    if (diffMinutes > 0 && diffMinutes <= 60) {
      notifiedTaskIds.add(task.id);
      fireDeadlineNotification(task, Math.round(diffMinutes));
    }
  });
}

/**
 * Fires both an in-app toast + browser notification for the deadline
 */
function fireDeadlineNotification(task, minutesLeft) {
  // In-app toast
  const timeLabel = minutesLeft <= 1 ? 'less than a minute' : `${minutesLeft} minutes`;
  showToast(`⏰ "${task.title}" is due in ${timeLabel}!`);

  // Add to notification dropdown
  addDeadlineToNotifDropdown(task, minutesLeft);

  // Browser Notification API (if permission granted)
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('TaskFlow Reminder ⏰', {
        body: `"${task.title}" is due in ${timeLabel}!`,
        icon: 'assets/images/logo.png',
        tag: `task-reminder-${task.id}`
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          new Notification('TaskFlow Reminder ⏰', {
            body: `"${task.title}" is due in ${timeLabel}!`,
            icon: 'assets/images/logo.png',
            tag: `task-reminder-${task.id}`
          });
        }
      });
    }
  }
}

/**
 * Adds a deadline reminder entry to the notifications dropdown
 */
function addDeadlineToNotifDropdown(task, minutesLeft) {
  if (!notifList) return;

  const timeLabel = minutesLeft <= 1 ? 'less than a minute' : `${minutesLeft} min`;
  const li = document.createElement('li');
  li.className = 'notif-item unread';
  li.innerHTML = `
    <div class="notif-dot"></div>
    <span>⏰ <strong>${escapeHTML(task.title)}</strong> is due in ${timeLabel}!</span>
  `;

  // Insert at top of list
  notifList.insertBefore(li, notifList.firstChild);

  // Update badge count
  if (notifBadge) {
    const currentCount = parseInt(notifBadge.textContent) || 0;
    notifBadge.textContent = currentCount + 1;
    notifBadge.classList.remove('hidden');
  }

  // Update "X new" pill in dropdown header
  const countPill = document.querySelector('.notif-count-pill');
  if (countPill) {
    const unreadItems = notifList.querySelectorAll('.notif-item.unread').length;
    countPill.textContent = `${unreadItems} new`;
  }
}

/**
 * Request notification permission on app start
 */
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Start the deadline checker interval (every 60 seconds)
let deadlineCheckInterval = null;
function startDeadlineChecker() {
  // Check immediately on start
  checkDeadlineReminders();
  // Then check every 60 seconds
  deadlineCheckInterval = setInterval(checkDeadlineReminders, 60000);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGreeting();
  initDateBadge();
  loadTasks();
  loadUserProfile();
  setupEventListeners();
  handleScreenFlow();
  renderAll();
  requestNotificationPermission();
  startDeadlineChecker();
});

/**
 * Handles Splash -> Onboarding -> Auth -> Main App transition
 * Strictly shows onboarding ONLY on first-time launch.
 * If user has active session: enters Main App directly.
 * If logged out: enters Sign In (or Sign Up if first time).
 */
function handleScreenFlow() {
  const currentUser = getCurrentUser();
  const isOnboarded = localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true';

  // Auto transition from splash after 1.8s
  const splashTimer = setTimeout(() => {
    dismissSplash(currentUser, isOnboarded);
  }, 1800);

  // Tap splash screen anywhere to dismiss immediately
  if (splashScreen) {
    splashScreen.addEventListener('click', () => {
      clearTimeout(splashTimer);
      dismissSplash(currentUser, isOnboarded);
    });
  }
}

function dismissSplash(currentUser, isOnboarded) {
  if (!splashScreen) return;
  splashScreen.style.opacity = '0';
  setTimeout(() => {
    splashScreen.classList.add('hidden');
    if (currentUser) {
      // User is already logged in with active session -> Go straight to Main App!
      showMainApp();
    } else if (!isOnboarded) {
      // First time installation/visit -> Show Onboarding Screen (Image 1)
      showOnboarding();
    } else {
      // Already completed onboarding before but logged out -> Go to Sign In screen!
      const users = getStoredUsers();
      if (users && users.length > 0) {
        showSignIn();
      } else {
        showSignUp();
      }
    }
  }, 400);
}

function showOnboarding() {
  hideAllScreens();
  if (onboardingScreen) onboardingScreen.classList.remove('hidden');
}

function showSignUp() {
  hideAllScreens();
  if (signupScreen) {
    signupScreen.classList.remove('hidden');
    hideSignupAlert();
    if (signupNameInput) signupNameInput.focus();
  }
}

function showSignIn() {
  hideAllScreens();
  if (signinScreen) {
    signinScreen.classList.remove('hidden');
    hideSigninAlert();
    if (signinEmailOrPhoneInput) signinEmailOrPhoneInput.focus();
  }
}

function showForgotPassword() {
  hideAllScreens();
  if (forgotPasswordScreen) {
    forgotPasswordScreen.classList.remove('hidden');
    if (forgotAlert) forgotAlert.classList.add('hidden');
    if (forgotOtpAndNewPassArea) forgotOtpAndNewPassArea.classList.add('hidden');
    if (submitForgotBtn) {
      const span = submitForgotBtn.querySelector('span');
      if (span) span.textContent = 'Verify & Continue';
      else submitForgotBtn.textContent = 'Verify & Continue';
    }
    if (forgotEmailOrPhoneInput) {
      forgotEmailOrPhoneInput.focus();
    }
  }
}

function showMainApp() {
  hideAllScreens();
  if (appShell) appShell.classList.remove('hidden');
  renderUserProfile();
  renderAll();
}

function hideAllScreens() {
  if (onboardingScreen) onboardingScreen.classList.add('hidden');
  if (signupScreen) signupScreen.classList.add('hidden');
  if (signinScreen) signinScreen.classList.add('hidden');
  if (forgotPasswordScreen) forgotPasswordScreen.classList.add('hidden');
  if (forgotPasswordModal) forgotPasswordModal.classList.add('hidden');
  if (appShell) appShell.classList.add('hidden');
}

// ==================== THEME MANAGEMENT ====================
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
  applyTheme(savedTheme);
  darkModeToggle.checked = savedTheme === 'dark';
}

function toggleDarkMode(isDark) {
  const newTheme = isDark ? 'dark' : 'light';
  applyTheme(newTheme);
  localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  if (darkModeToggle) darkModeToggle.checked = isDark;
  showToast(isDark ? 'Dark theme enabled 🌙' : 'Light theme enabled ☀️');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// ==================== GREETING & DATE ====================
function initGreeting() {
  updateHeaderContext('viewHome');
  if (dynamicGreeting) {
    const hour = new Date().getHours();
    let greeting = 'Good Morning 👋';
    if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon ☀️';
    } else if (hour >= 17 || hour < 4) {
      greeting = 'Good Evening 🌙';
    }
    dynamicGreeting.textContent = greeting;
  }
}

function initDateBadge() {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const formatted = new Date().toLocaleDateString('en-US', options);
  if (currentDateBadge) currentDateBadge.textContent = formatted;
  if (dynamicDateBadge) dynamicDateBadge.textContent = formatted;
}

// ==================== DATA PERSISTENCE (LOCALSTORAGE) ====================
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If previous tasks match the legacy demo task IDs, clear them for a completely fresh start as requested
      const legacyIds = [1726300000001, 1726300000002, 1726300000003, 1726300000004];
      const isLegacyDemo = Array.isArray(parsed) && parsed.length > 0 && parsed.every(t => legacyIds.includes(t.id));
      if (isLegacyDemo) {
        tasks = [];
        saveTasks();
      } else {
        tasks = parsed;
      }
    } else {
      // First time loading - initialize completely clean & fresh with 0 tasks
      tasks = [];
      saveTasks();
    }
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    tasks = [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
    showToast('Failed to save to storage ⚠️');
  }
}

// ==================== USER PROFILE MANAGEMENT ====================
function loadUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      userProfile = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } else {
      userProfile = { ...DEFAULT_PROFILE };
    }
  } catch (e) {
    console.error('Failed to load profile from localStorage', e);
    userProfile = { ...DEFAULT_PROFILE };
  }
  renderUserProfile();
}

function saveUserProfile() {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
    showToast('Failed to save profile ⚠️');
  }
}

function getInitials(name) {
  if (!name || !name.trim()) return 'MA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderUserProfile() {
  const initials = getInitials(userProfile.name);

  // Update initials everywhere
  document.querySelectorAll('.user-initials-display').forEach(el => {
    el.textContent = initials;
  });

  // Update name displays
  document.querySelectorAll('.user-name-display').forEach(el => {
    el.textContent = userProfile.name || 'User';
  });

  // Update role displays
  document.querySelectorAll('.user-role-display').forEach(el => {
    el.textContent = userProfile.role || 'Manage profile →';
  });

  // Update email displays
  document.querySelectorAll('.user-email-display').forEach(el => {
    el.textContent = userProfile.email || 'user@taskflow.io';
  });

  // Update avatar images vs initials
  document.querySelectorAll('.user-img-display').forEach(img => {
    if (userProfile.avatarImg) {
      img.src = userProfile.avatarImg;
      img.classList.remove('hidden');
    } else {
      img.classList.add('hidden');
      img.src = '';
    }
  });

  document.querySelectorAll('.user-initials-display').forEach(span => {
    if (userProfile.avatarImg) {
      span.classList.add('hidden');
    } else {
      span.classList.remove('hidden');
    }
  });

  // Update preset avatar button highlights
  document.querySelectorAll('.preset-avatar-btn').forEach(btn => {
    if (btn.dataset.preset === userProfile.presetAvatar) {
      btn.style.borderColor = 'var(--primary)';
      btn.style.transform = 'scale(1.1)';
    } else {
      btn.style.borderColor = 'transparent';
      btn.style.transform = 'none';
    }
  });

  // Populate profile form inputs if available
  if (profileNameInput) profileNameInput.value = userProfile.name || '';
  if (profileUsernameInput) profileUsernameInput.value = userProfile.username || '';
  if (profileEmailInput) profileEmailInput.value = userProfile.email || '';
  if (profileRoleInput) profileRoleInput.value = userProfile.role || '';
  if (profileBioInput) profileBioInput.value = userProfile.bio || '';

  updateProfileStats();
}

function updateProfileStats() {
  if (!profileStatTotal) return;
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  profileStatTotal.textContent = total;
  profileStatCompleted.textContent = completed;
  profileStatRate.textContent = `${rate}%`;

  const bar = document.getElementById('profileRateProgressBar');
  if (bar) {
    bar.style.width = `${rate}%`;
  }

  const streakDays = completed > 0 ? Math.min(completed, 7) : 0;
  profileStatStreak.textContent = streakDays > 0 ? `${streakDays} Day${streakDays > 1 ? 's' : ''}` : '0 Days';
}

function handleAvatarFileUpload(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file');
    return;
  }

  // Max 5MB raw
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image should be smaller than 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    // Compress and resize image using canvas so localStorage is preserved
    const img = new Image();
    img.onload = () => {
      const maxDim = 320;
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      userProfile.avatarImg = compressedDataUrl;
      userProfile.presetAvatar = null;
      saveUserProfile();
      renderUserProfile();
      showToast('Profile photo updated! 📸');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleRemovePhoto() {
  userProfile.avatarImg = null;
  userProfile.presetAvatar = null;
  saveUserProfile();
  renderUserProfile();
  showToast('Profile photo removed');
}

function handlePresetAvatar(presetKey) {
  const presets = {
    'preset-1': 'https://api.dicebear.com/7.x/bottts/svg?seed=TaskFlow',
    'preset-2': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zen',
    'preset-3': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Blaze',
    'preset-4': 'https://api.dicebear.com/7.x/shapes/svg?seed=Rocket',
    'preset-5': 'https://api.dicebear.com/7.x/identicon/svg?seed=Focus'
  };

  userProfile.presetAvatar = presetKey;
  // If user chooses a preset, we can set it as avatarImg URL or SVG
  userProfile.avatarImg = presets[presetKey] || null;
  saveUserProfile();
  renderUserProfile();
  showToast('Preset avatar selected! ✨');
}

// ==================== CRUD OPERATIONS ====================

/**
 * Add a new task or update an existing one
 */
function saveTaskFromModal(e) {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  if (!title) {
    titleError.classList.remove('hidden');
    taskTitleInput.focus();
    return;
  }
  titleError.classList.add('hidden');

  const desc = taskDescInput.value.trim();
  const category = taskCategorySelect.value || 'Product Design';
  const priority = getSelectedPriority();
  const dueDate = taskDueDate.value || getTodayDateString();
  const dueTime = taskDueTime.value || '17:00';
  const taskId = editTaskId.value ? parseInt(editTaskId.value) : null;

  if (taskId) {
    // Edit Existing Task
    const existingIndex = tasks.findIndex(t => t.id === taskId);
    if (existingIndex !== -1) {
      tasks[existingIndex] = {
        ...tasks[existingIndex],
        title,
        description: desc,
        category,
        priority,
        dueDate,
        dueTime,
        subtasks: [...currentModalSubtasks]
      };
      showToast('Task updated successfully ✨');
    }
  } else {
    // Create New Task
    const newTask = {
      id: Date.now(),
      title,
      description: desc,
      category,
      priority,
      dueDate,
      dueTime,
      completed: false,
      subtasks: [...currentModalSubtasks],
      createdAt: getTodayDateString()
    };
    tasks.unshift(newTask);
    showToast('Task created! 🚀');
  }

  saveTasks();
  closeTaskModal();
  renderAll();
}

/**
 * Opens modal populated with task info for editing
 */
function openEditTaskModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editTaskId.value = task.id;
  if (modalTitle) modalTitle.textContent = 'Edit Task';
  if (saveTaskBtnText) saveTaskBtnText.textContent = 'Update Task';
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description || '';
  
  // Set Category
  setSelectedCategory(task.category);

  // Set Priority
  setSelectedPriority(task.priority);

  // Set Due Date
  const dateVal = task.dueDate || getTodayDateString();
  taskDueDate.value = dateVal;
  taskDueTime.value = task.dueTime || '17:00';
  syncDueDateUI(dateVal);

  currentModalSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
  renderSubtasksInModal();

  titleError.classList.add('hidden');
  taskModal.classList.remove('hidden');
  taskTitleInput.focus();
}

/**
 * Toggles main task completion status
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderAll();

  if (task.completed) {
    showToast('Task completed! Great job! 🎉');
  }
}

/**
 * Toggles a single subtask inside a task
 */
function toggleSubtask(taskId, subtaskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks) return;

  const sub = task.subtasks.find(s => s.id === subtaskId);
  if (sub) {
    sub.completed = !sub.completed;
    saveTasks();
    renderAll();
  }
}

/**
 * Prompt delete confirmation modal
 */
function promptDeleteTask(id) {
  pendingDeleteId = id;
  deleteModal.classList.remove('hidden');
}

/**
 * Confirm deletion
 */
function confirmDeleteTask() {
  if (!pendingDeleteId) return;

  tasks = tasks.filter(t => t.id !== pendingDeleteId);
  pendingDeleteId = null;
  saveTasks();
  deleteModal.classList.add('hidden');
  renderAll();
  showToast('Task deleted 🗑️');
}

// ==================== RENDERING ====================

/**
 * Master render function that updates all views, stats & badges
 */
function renderAll() {
  updateStatistics();
  updateProgress();
  updateCategoryCounts();
  updateNavbarBadges();
  updateNotifications();
  updateProfileStats();
  renderTaskList(taskListContainer);
  renderTaskList(tasksViewListContainer);
  renderCategoriesMatrix();
}

/**
 * Update real-time badges on desktop sidebar and mobile navigation
 */
function updateNavbarBadges() {
  const pendingCount = tasks.filter(t => !t.completed).length;

  if (sidebarTasksCount) {
    sidebarTasksCount.textContent = pendingCount;
    if (pendingCount > 0) {
      sidebarTasksCount.classList.remove('hidden');
    } else {
      sidebarTasksCount.classList.add('hidden');
    }
  }

  if (mobileNavTasksBadge) {
    mobileNavTasksBadge.textContent = pendingCount;
    if (pendingCount > 0) {
      mobileNavTasksBadge.classList.remove('hidden');
    } else {
      mobileNavTasksBadge.classList.add('hidden');
    }
  }

  // Update categories count in sidebar
  if (sidebarCatsCount) {
    const distinctCats = new Set(tasks.map(t => t.category)).size;
    sidebarCatsCount.textContent = distinctCats > 0 ? distinctCats : 6;
  }

  // Format today's date in top header
  if (dynamicDateBadge) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dynamicDateBadge.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

/**
 * Calculate and render summary counters
 */
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter(t => t.priority === 'High' && !t.completed).length;

  statTotal.textContent = total;
  statCompleted.textContent = completed;
  statPending.textContent = pending;
  statHigh.textContent = highPriority;
}

/**
 * Update dynamic productivity progress bar
 */
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressPercentage.textContent = `${pct}%`;
  progressBarFill.style.width = `${pct}%`;
  progressSubText.textContent = `${completed} of ${total} tasks completed`;
}

/**
 * Update counts in Category Pill buttons
 */
function updateCategoryCounts() {
  const pills = categoryPillsContainer.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    const cat = pill.dataset.category;
    let count = 0;
    if (cat === 'All') {
      count = tasks.length;
    } else {
      count = tasks.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length;
    }
    const badge = pill.querySelector('.cat-count');
    if (badge) badge.textContent = count;
  });
}

/**
 * Update Notifications list & bell badge
 */
function updateNotifications() {
  const todayStr = getTodayDateString();
  const notifications = [];

  // Find due today
  const dueToday = tasks.filter(t => !t.completed && t.dueDate === todayStr);
  if (dueToday.length > 0) {
    notifications.push({
      id: 1,
      unread: true,
      text: `You have ${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today!`
    });
  }

  // Find high priority pending
  const highPending = tasks.filter(t => !t.completed && t.priority === 'High');
  if (highPending.length > 0) {
    notifications.push({
      id: 2,
      unread: true,
      text: `${highPending.length} high priority task${highPending.length > 1 ? 's' : ''} require attention.`
    });
  }

  // General encouragement
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount > 0) {
    notifications.push({
      id: 3,
      unread: false,
      text: `Awesome momentum! You have completed ${completedCount} tasks so far.`
    });
  }

  // Render badge
  const unreadCount = notifications.filter(n => n.unread).length;
  if (unreadCount > 0) {
    notifBadge.textContent = unreadCount;
    notifBadge.classList.remove('hidden');
  } else {
    notifBadge.classList.add('hidden');
  }

  // Render dropdown list
  if (notifications.length === 0) {
    notifList.innerHTML = `<li class="notif-item"><span>All caught up! No notifications.</span></li>`;
  } else {
    notifList.innerHTML = notifications.map(n => `
      <li class="notif-item ${n.unread ? 'unread' : ''}">
        <div class="notif-dot"></div>
        <span>${escapeHTML(n.text)}</span>
      </li>
    `).join('');
  }
}

/**
 * Renders task cards matching current filters and search query
 */
function renderTaskList(container) {
  if (!container) return;

  const filtered = filterTasksList(tasks);

  // Update list header count
  if (container === taskListContainer) {
    taskCountBadge.textContent = `${filtered.length} task${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = getEmptyStateHTML();
    return;
  }

  container.innerHTML = filtered.map(task => createTaskCardHTML(task)).join('');
}

/**
 * Filters the tasks array according to category, status tab, and search
 */
function filterTasksList(list) {
  const todayStr = getTodayDateString();

  return list.filter(task => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(q);
      const descMatch = task.description && task.description.toLowerCase().includes(q);
      const catMatch = task.category.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !catMatch) return false;
    }

    // 2. Category Filter
    if (activeCategory !== 'All' && task.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }

    // 3. Status Tab Filter
    switch (activeStatus) {
      case 'today':
        return task.dueDate === todayStr;
      case 'upcoming':
        return task.dueDate > todayStr;
      case 'completed':
        return task.completed;
      case 'pending':
        return !task.completed;
      case 'high':
        return task.priority === 'High';
      case 'all':
      default:
        return true;
    }
  });
}

/**
 * Generates HTML string for a single task card
 */
function createTaskCardHTML(task) {
  const isCompleted = task.completed;
  const priorityClass = `badge-priority-${task.priority.toLowerCase()}`;
  const formattedDateTime = formatTaskDue(task.dueDate, task.dueTime);

  // Subtasks progress
  const subtasks = task.subtasks || [];
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(s => s.completed).length;

  return `
    <div class="task-card ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
      <div class="task-card-main">
        <!-- Checkbox -->
        <label class="task-checkbox-container" title="${isCompleted ? 'Mark as pending' : 'Mark as completed'}">
          <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTask(${task.id})">
          <div class="task-custom-checkbox">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </label>

        <!-- Body -->
        <div class="task-body">
          <h4 class="task-title-text">${escapeHTML(task.title)}</h4>
          ${task.description ? `<p class="task-desc-text">${escapeHTML(task.description)}</p>` : ''}

          <!-- Metadata Badges -->
          <div class="task-meta-row">
            <span class="badge-pill badge-category">${escapeHTML(task.category)}</span>
            <span class="badge-pill ${priorityClass}">${escapeHTML(task.priority)}</span>
            <span class="task-datetime ${formattedDateTime.class}">${formattedDateTime.text}</span>
          </div>

          <!-- Subtasks Section -->
          ${totalSubtasks > 0 ? `
            <div class="subtasks-wrapper">
              <button class="subtasks-toggle-btn" onclick="toggleSubtasksView(this, ${task.id})">
                <span>Subtasks: ${completedSubtasks}/${totalSubtasks}</span>
                <svg class="subtasks-toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="subtasks-list hidden" id="subtaskList-${task.id}">
                ${subtasks.map(sub => `
                  <div class="subtask-item ${sub.completed ? 'completed' : ''}" onclick="toggleSubtask(${task.id}, ${sub.id})">
                    <div class="subtask-mini-checkbox">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>${escapeHTML(sub.text)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="task-card-footer">
        <button class="card-action-btn" onclick="openEditTaskModal(${task.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Edit
        </button>
        <button class="card-action-btn btn-delete" onclick="promptDeleteTask(${task.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete
        </button>
      </div>
    </div>
  `;
}

/**
 * Toggle expandable subtasks inside card
 */
function toggleSubtasksView(btn, taskId) {
  const container = document.getElementById(`subtaskList-${taskId}`);
  if (!container) return;

  const isHidden = container.classList.contains('hidden');
  if (isHidden) {
    container.classList.remove('hidden');
    btn.classList.add('open');
  } else {
    container.classList.add('hidden');
    btn.classList.remove('open');
  }
}

/**
 * Renders interactive category matrix cards in Categories View
 */
function renderCategoriesMatrix() {
  if (!categoriesMatrix) return;

  const categories = [
    { name: 'Product Design', icon: '🎨', color: '#4F46E5' },
    { name: 'Work', icon: '💼', color: '#059669' },
    { name: 'Personal', icon: '🌿', color: '#7C3AED' },
    { name: 'Study', icon: '📚', color: '#D97706' },
    { name: 'Shopping', icon: '🛒', color: '#E11D48' },
    { name: 'Project', icon: '🚀', color: '#0284C7' },
    { name: 'Other', icon: '✨', color: '#8B5CF6' }
  ];

  categoriesMatrix.innerHTML = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category.toLowerCase() === cat.name.toLowerCase());
    const total = catTasks.length;
    const completed = catTasks.filter(t => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    return `
      <div class="category-card" onclick="selectCategoryAndGoHome('${cat.name}')">
        <div class="category-card-top">
          <div class="category-card-icon" style="background: ${cat.color}18; color: ${cat.color}">
            <span style="font-size: 18px;">${cat.icon}</span>
          </div>
          <span class="badge-subtle">${total} tasks</span>
        </div>
        <div>
          <h4 class="category-card-title">${cat.name}</h4>
          <span class="category-card-stats">${completed} of ${total} done (${pct}%)</span>
        </div>
        <div class="category-mini-bar">
          <div class="category-mini-fill" style="width: ${pct}%; background: ${cat.color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function selectCategoryAndGoHome(categoryName) {
  // Set active category
  activeCategory = categoryName;

  // Update pills UI
  const pills = categoryPillsContainer.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    if (pill.dataset.category.toLowerCase() === categoryName.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Switch tab to Home
  switchView('viewHome');
  renderAll();
}

/**
 * Empty state HTML component
 */
function getEmptyStateHTML() {
  const isFiltered = activeCategory !== 'All' || activeStatus !== 'all' || searchQuery;
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12h8"></path>
          <path d="M12 8v8"></path>
        </svg>
      </div>
      <h4 class="empty-state-title">${isFiltered ? 'No matching tasks' : 'No tasks yet'}</h4>
      <p class="empty-state-desc">
        ${isFiltered 
          ? 'Try adjusting your search terms or filter settings to find what you are looking for.' 
          : 'Start organizing your day by creating your first task.'}
      </p>
      <button class="btn btn-primary btn-sm" onclick="openAddTaskModal()">
        + Add ${isFiltered ? 'New' : 'Your First'} Task
      </button>
    </div>
  `;
}

// ==================== MODAL SUBTASK BUILDER (IMAGE 2) ====================
function addSubtaskToModal() {
  const text = newSubtaskInput.value.trim();
  if (!text) return;

  currentModalSubtasks.push({
    id: Date.now(),
    text,
    completed: false
  });

  newSubtaskInput.value = '';
  renderSubtasksInModal();
  newSubtaskInput.focus();
}

function removeSubtaskFromModal(id) {
  currentModalSubtasks = currentModalSubtasks.filter(s => s.id !== id);
  renderSubtasksInModal();
}

function toggleSubtaskInModal(id) {
  const sub = currentModalSubtasks.find(s => s.id === id);
  if (sub) {
    sub.completed = !sub.completed;
    renderSubtasksInModal();
  }
}

function renderSubtasksInModal() {
  const total = currentModalSubtasks.length;
  const completed = currentModalSubtasks.filter(s => s.completed).length;

  if (subtasksCountBadge) {
    subtasksCountBadge.textContent = `${completed} of ${total} done`;
  }

  if (!subtasksBuilderList) return;

  if (total === 0) {
    subtasksBuilderList.innerHTML = '';
    return;
  }

  subtasksBuilderList.innerHTML = currentModalSubtasks.map(s => `
    <div class="subtask-interactive-row ${s.completed ? 'completed' : ''}">
      <button type="button" class="subtask-check-box" onclick="toggleSubtaskInModal(${s.id})" aria-label="Toggle step">
        ${s.completed ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
      </button>
      <span class="subtask-interactive-text">${escapeHTML(s.text)}</span>
      <button type="button" class="subtask-delete-icon-btn" onclick="removeSubtaskFromModal(${s.id})" title="Delete step">✕</button>
    </div>
  `).join('');
}

// ==================== IMAGE 2 TASK CONTROLS & SYNC HELPERS ====================
function getSelectedPriority() {
  const active = document.querySelector('.priority-segment-btn.active');
  return active ? active.dataset.priority : 'High';
}

function setSelectedPriority(val) {
  const normalized = val ? val.toLowerCase() : 'high';
  prioritySegmentBtns.forEach(btn => {
    if (btn.dataset.priority.toLowerCase() === normalized) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (priorityBadgeIndicator) {
    const formatted = val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : 'High';
    priorityBadgeIndicator.textContent = formatted;
    priorityBadgeIndicator.className = `priority-badge-indicator badge-${normalized}`;
  }
}

function setSelectedCategory(catName) {
  const chosen = catName || 'Product Design';
  const normalized = chosen.toLowerCase();
  if (taskCategorySelect) taskCategorySelect.value = chosen;
  if (categorySelectedBadge) categorySelectedBadge.textContent = chosen;

  catChipBtns.forEach(btn => {
    if (btn.dataset.category && btn.dataset.category.toLowerCase() === normalized) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function formatReadableDate(dateStr) {
  if (!dateStr) return 'Sep 14, 2026';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {}
  return dateStr;
}

function formatReadableTime(timeStr) {
  if (!timeStr) return '05:00 PM';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const mins = parts[1].padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${mins} ${ampm}`;
  }
  return timeStr;
}

function getTimePeriodInfo(timeStr) {
  if (!timeStr) return { label: 'Evening', isAmber: true };
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return { label: 'Morning', isAmber: true };
  if (hour >= 12 && hour < 17) return { label: 'Afternoon', isAmber: false };
  if (hour >= 17 && hour < 21) return { label: 'Evening', isAmber: true };
  return { label: 'Night', isAmber: false };
}

function syncDueTimeUI() {
  const timeVal = taskDueTime ? taskDueTime.value || '17:00' : '17:00';
  const formattedTime = formatReadableTime(timeVal);

  if (timeDisplayFormatted) timeDisplayFormatted.textContent = formattedTime;

  if (timeBadgeText) {
    const period = getTimePeriodInfo(timeVal);
    timeBadgeText.textContent = period.label;
    if (period.isAmber) {
      timeBadgeText.classList.add('dt-badge-amber');
    } else {
      timeBadgeText.classList.remove('dt-badge-amber');
    }
  }

  // Update quick time preset buttons active state
  if (timePresetBtns) {
    timePresetBtns.forEach(btn => {
      if (btn.dataset.time === timeVal) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateDueStatusSummary();
}

function updateDueStatusSummary() {
  const dateVal = taskDueDate ? taskDueDate.value : '';
  const timeVal = taskDueTime ? taskDueTime.value || '17:00' : '17:00';
  const formattedTime = formatReadableTime(timeVal);
  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  let datePart = 'Scheduled';
  if (dateVal === todayStr) {
    datePart = 'Today';
  } else if (dateVal === tomorrowStr) {
    datePart = 'Tomorrow';
  } else if (dateVal) {
    datePart = formatShortDate(dateVal);
  }

  if (dueDateStatusLabel) {
    dueDateStatusLabel.textContent = `${datePart} • ${formattedTime}`;
  }
}

function syncDueDateUI(dateStr) {
  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  if (pillDueToday) pillDueToday.classList.remove('active');
  if (pillDueTomorrow) pillDueTomorrow.classList.remove('active');
  if (pillDueCustom) pillDueCustom.classList.remove('active');

  if (dateStr === todayStr) {
    if (pillDueToday) pillDueToday.classList.add('active');
    if (customDatePillText) customDatePillText.textContent = 'Pick Date';
    if (dateBadgeText) dateBadgeText.textContent = 'Today';
  } else if (dateStr === tomorrowStr) {
    if (pillDueTomorrow) pillDueTomorrow.classList.add('active');
    if (customDatePillText) customDatePillText.textContent = 'Pick Date';
    if (dateBadgeText) dateBadgeText.textContent = 'Tomorrow';
  } else {
    if (pillDueCustom) pillDueCustom.classList.add('active');
    const formatted = formatShortDate(dateStr);
    if (customDatePillText) customDatePillText.textContent = formatted;
    if (dateBadgeText) dateBadgeText.textContent = formatted;
  }

  if (dateDisplayFormatted) {
    dateDisplayFormatted.textContent = formatReadableDate(dateStr);
  }

  syncDueTimeUI();
}

function formatShortDate(dateStr) {
  if (!dateStr) return 'Pick Date';
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || '';
  return `${month} ${parseInt(parts[2], 10) || ''}`;
}

// ==================== AUTHENTICATION LOGIC ====================

/**
 * Checks password strength against 4 criteria:
 * 1. 8+ characters
 * 2. Uppercase & lowercase letters
 * 3. Numbers
 * 4. Special symbols
 */
function evaluatePasswordStrength(val) {
  const res = {
    length: val.length >= 8,
    casing: /[a-z]/.test(val) && /[A-Z]/.test(val),
    number: /\d/.test(val),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)
  };
  const score = Object.values(res).filter(Boolean).length;
  return { ...res, score };
}

function handlePasswordStrength(e) {
  const val = e.target.value;
  const { length, casing, number, special, score } = evaluatePasswordStrength(val);

  // Update criteria checklist classes
  if (ruleLength) ruleLength.classList.toggle('valid', length);
  if (ruleCase) ruleCase.classList.toggle('valid', casing);
  if (ruleNumber) ruleNumber.classList.toggle('valid', number);
  if (ruleSpecial) ruleSpecial.classList.toggle('valid', special);

  // Update Modern Segmented Meter
  const seg1 = document.getElementById('seg1');
  const seg2 = document.getElementById('seg2');
  const seg3 = document.getElementById('seg3');
  const seg4 = document.getElementById('seg4');
  const segs = [seg1, seg2, seg3, seg4];

  segs.forEach(s => { if (s) s.style.background = ''; });

  if (val) {
    if (score === 1) {
      if (seg1) seg1.style.background = '#EF4444';
    } else if (score === 2) {
      if (seg1) seg1.style.background = '#F59E0B';
      if (seg2) seg2.style.background = '#F59E0B';
    } else if (score === 3) {
      if (seg1) seg1.style.background = '#3B82F6';
      if (seg2) seg2.style.background = '#3B82F6';
      if (seg3) seg3.style.background = '#3B82F6';
    } else if (score >= 4) {
      if (seg1) seg1.style.background = '#10B981';
      if (seg2) seg2.style.background = '#10B981';
      if (seg3) seg3.style.background = '#10B981';
      if (seg4) seg4.style.background = '#10B981';
    }
  }

  // Update Strength Status Text
  if (!strengthText) return;

  if (!val) {
    strengthText.textContent = 'None';
    strengthText.className = 'strength-status-text';
  } else if (score <= 1) {
    strengthText.textContent = 'Weak';
    strengthText.className = 'strength-status-text weak';
  } else if (score <= 2) {
    strengthText.textContent = 'Fair';
    strengthText.className = 'strength-status-text medium';
  } else if (score === 3) {
    strengthText.textContent = 'Good';
    strengthText.className = 'strength-status-text medium';
  } else {
    strengthText.textContent = 'Strong 🔒';
    strengthText.className = 'strength-status-text strong';
  }
}

/**
 * Sign Up Form Submission:
 * Enforces strong password and prevents duplicate accounts with same email/phone
 */
function handleSignUp(e) {
  e.preventDefault();
  hideSignupAlert();

  const name = signupNameInput.value.trim();
  const emailOrPhone = signupEmailOrPhoneInput.value.trim();
  const password = signupPasswordInput.value;
  const confirmPassword = signupConfirmPasswordInput.value;

  if (!name) {
    showSignupAlert('Please enter your full name.');
    signupNameInput.focus();
    return;
  }

  if (!emailOrPhone) {
    showSignupAlert('Please enter a valid email or phone number.');
    signupEmailOrPhoneInput.focus();
    return;
  }

  // 1. DUPLICATE ACCOUNT CHECK
  const users = getStoredUsers();
  const normalizedInput = emailOrPhone.toLowerCase();
  const existingUser = users.find(u => u.emailOrPhone.trim().toLowerCase() === normalizedInput);
  
  if (existingUser) {
    showSignupAlert('An account with this email/phone already exists. Please Sign In.', true);
    return;
  }

  // 2. PASSWORD CHECK
  if (password.length < 6) {
    showSignupAlert('Password must be at least 6 characters long.');
    signupPasswordInput.focus();
    return;
  }

  if (password !== confirmPassword) {
    showSignupAlert('Passwords do not match. Please re-check.');
    signupConfirmPasswordInput.focus();
    return;
  }

  // 3. CREATE NEW ACCOUNT & LOG IN
  const newUser = {
    id: Date.now(),
    name,
    emailOrPhone,
    password,
    role: 'Productivity Champion',
    createdAt: getTodayDateString()
  };

  users.push(newUser);
  saveStoredUsers(users);
  setCurrentUser(newUser);

  // Update profile
  userProfile.name = name;
  userProfile.email = emailOrPhone;
  userProfile.username = '@' + name.toLowerCase().replace(/\s+/g, '');
  saveUserProfile();

  // Mark onboarding completed
  localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');

  showToast(`Welcome to TaskFlow, ${name}! 🎉`);
  showMainApp();
}

function showSignupAlert(msg, showAction = false) {
  if (!signupAlert || !signupAlertText) return;
  signupAlertText.textContent = msg;
  signupAlert.classList.remove('hidden');
  if (signupAlertActionBtn) {
    signupAlertActionBtn.classList.toggle('hidden', !showAction);
  }
}

function hideSignupAlert() {
  if (signupAlert) signupAlert.classList.add('hidden');
}

/**
 * Sign In Form Submission
 */
function handleSignIn(e) {
  e.preventDefault();
  hideSigninAlert();

  const emailOrPhone = signinEmailOrPhoneInput.value.trim().toLowerCase();
  const password = signinPasswordInput.value;

  if (!emailOrPhone || !password) {
    showSigninAlert('Please enter both email/phone and password.');
    return;
  }

  const users = getStoredUsers();
  const matchedUser = users.find(u => u.emailOrPhone.trim().toLowerCase() === emailOrPhone && u.password === password);

  if (!matchedUser) {
    showSigninAlert('Invalid email/phone or password. Please try again or click Forgot Password.');
    return;
  }

  // Set logged in session
  setCurrentUser(matchedUser);

  // Sync profile details
  userProfile.name = matchedUser.name;
  userProfile.email = matchedUser.emailOrPhone;
  if (!userProfile.username) userProfile.username = '@' + matchedUser.name.toLowerCase().replace(/\s+/g, '');
  saveUserProfile();

  // Mark onboarding completed
  localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');

  showToast(`Welcome back, ${matchedUser.name}! 👋`);
  showMainApp();
}

function showSigninAlert(msg) {
  if (!signinAlert || !signinAlertText) return;
  signinAlertText.textContent = msg;
  signinAlert.classList.remove('hidden');
}

function hideSigninAlert() {
  if (signinAlert) signinAlert.classList.add('hidden');
}

/**
 * Quick demo login button for Muhammad Adil
 */
function handleQuickDemoLogin() {
  const users = getStoredUsers();
  let demo = users.find(u => u.emailOrPhone === 'es0155@taskflow.io');
  if (!demo) {
    demo = {
      id: 1,
      name: 'Muhammad Adil',
      emailOrPhone: 'es0155@taskflow.io',
      password: 'Password@123',
      role: 'Productivity Champion'
    };
    users.push(demo);
    saveStoredUsers(users);
  }

  setCurrentUser(demo);
  userProfile.name = demo.name;
  userProfile.email = demo.emailOrPhone;
  saveUserProfile();

  localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
  showToast('Signed in as Muhammad Adil! 🚀');
  showMainApp();
}

/**
 * Forgot Password Flow
 */
function openForgotPasswordModal() {
  if (!forgotPasswordModal) return;
  forgotPasswordForm.reset();
  if (forgotAlert) forgotAlert.classList.add('hidden');
  if (forgotOtpAndNewPassArea) forgotOtpAndNewPassArea.classList.add('hidden');
  if (submitForgotBtn) submitForgotBtn.textContent = 'Verify & Continue';
  forgotPasswordModal.classList.remove('hidden');
  if (forgotEmailOrPhoneInput) forgotEmailOrPhoneInput.focus();
}

function closeForgotPasswordModal() {
  if (forgotPasswordModal) forgotPasswordModal.classList.add('hidden');
}

function handleForgotPassword(e) {
  e.preventDefault();
  if (forgotAlert) forgotAlert.classList.add('hidden');

  const emailOrPhone = forgotEmailOrPhoneInput.value.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find(u => u.emailOrPhone.trim().toLowerCase() === emailOrPhone);

  if (!user) {
    showForgotAlert('No account found with this email or phone number.');
    return;
  }

  // Step 1: If OTP area is still hidden, reveal it
  if (forgotOtpAndNewPassArea.classList.contains('hidden')) {
    forgotOtpAndNewPassArea.classList.remove('hidden');
    // Generate simulated 4-digit code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    if (generatedOtpDisplay) generatedOtpDisplay.textContent = otp;
    if (forgotOtpInput) forgotOtpInput.value = otp; // Pre-fill for friction-free testing
    if (submitForgotBtn) {
      const span = submitForgotBtn.querySelector('span');
      if (span) span.textContent = 'Reset Password';
      else submitForgotBtn.textContent = 'Reset Password';
    }
    showToast(`Verification code sent: ${otp} 🔑`);
    if (forgotNewPasswordInput) forgotNewPasswordInput.focus();
    return;
  }

  // Step 2: Validate new password
  const newPass = forgotNewPasswordInput.value;
  const confirmPass = forgotConfirmPasswordInput.value;

  const { score, length } = evaluatePasswordStrength(newPass);
  if (!length || score < 3) {
    showForgotAlert('Please choose a strong new password (min 8 chars, uppercase, lowercase, numbers, symbols).');
    return;
  }

  if (newPass !== confirmPass) {
    showForgotAlert('Passwords do not match. Please re-enter.');
    return;
  }

  // Update password in stored users
  user.password = newPass;
  saveStoredUsers(users);

  closeForgotPasswordModal();
  showToast('Password reset successfully! Please Sign In 🔐');
  showSignIn();
  if (signinEmailOrPhoneInput) signinEmailOrPhoneInput.value = emailOrPhone;
  if (signinPasswordInput) signinPasswordInput.value = '';
}

function showForgotAlert(msg) {
  if (!forgotAlert || !forgotAlertText) return;
  forgotAlertText.textContent = msg;
  forgotAlert.classList.remove('hidden');
}

/**
 * Sign Out from workspace
 */
function handleSignOut() {
  setCurrentUser(null);
  showToast('Signed out of TaskFlow 👋');
  showSignIn();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // 1. Onboarding actions
  if (skipOnboardingBtn) {
    skipOnboardingBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
      const users = getStoredUsers();
      if (users && users.length > 0) {
        showSignIn();
      } else {
        showSignUp();
      }
    });
  }

  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
      showSignUp();
    });
  }

  if (goToSignInFromOnboarding) {
    goToSignInFromOnboarding.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
      showSignIn();
    });
  }

  // 2. Auth Flow Listeners
  if (signupForm) signupForm.addEventListener('submit', handleSignUp);
  if (goToSignInBtn) goToSignInBtn.addEventListener('click', showSignIn);
  if (tabGoToSignIn) tabGoToSignIn.addEventListener('click', showSignIn);
  if (tabGoToSignUp) tabGoToSignUp.addEventListener('click', showSignUp);

  if (signupAlertActionBtn) {
    signupAlertActionBtn.addEventListener('click', () => {
      showSignIn();
      if (signinEmailOrPhoneInput && signupEmailOrPhoneInput) {
        signinEmailOrPhoneInput.value = signupEmailOrPhoneInput.value;
      }
    });
  }
  if (signupPasswordInput) signupPasswordInput.addEventListener('input', handlePasswordStrength);

  if (signinForm) signinForm.addEventListener('submit', handleSignIn);
  if (goToSignUpBtn) goToSignUpBtn.addEventListener('click', showSignUp);
  if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', showForgotPassword);
  if (quickDemoLoginBtn) quickDemoLoginBtn.addEventListener('click', handleQuickDemoLogin);
  if (signupQuickDemoBtn) signupQuickDemoBtn.addEventListener('click', handleQuickDemoLogin);

  // Dedicated Forgot Password Screen Navigation
  if (backToSignInFromForgotBtn) backToSignInFromForgotBtn.addEventListener('click', showSignIn);
  if (forgotGoToSignInBtn) forgotGoToSignInBtn.addEventListener('click', showSignIn);

  // Google OAuth Simulation
  document.querySelectorAll('.btn-google-login').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Connecting with Google... Signed in! 🚀');
      handleQuickDemoLogin();
    });
  });

  // Auth Screen Theme Toggles
  const handleAuthThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    toggleDarkMode(currentTheme !== 'dark');
  };
  if (authThemeToggleSignUp) authThemeToggleSignUp.addEventListener('click', handleAuthThemeToggle);
  if (authThemeToggleSignIn) authThemeToggleSignIn.addEventListener('click', handleAuthThemeToggle);
  if (authThemeToggleForgot) authThemeToggleForgot.addEventListener('click', handleAuthThemeToggle);

  if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  if (closeForgotModalBtn) closeForgotModalBtn.addEventListener('click', showSignIn);
  if (cancelForgotBtn) cancelForgotBtn.addEventListener('click', showSignIn);

  // Password Visibility Toggle Buttons
  document.querySelectorAll('.auth-pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
      }
    });
  });

  // Sign Out Buttons
  if (settingsSignOutBtn) settingsSignOutBtn.addEventListener('click', handleSignOut);
  if (profileSignOutBtn) profileSignOutBtn.addEventListener('click', handleSignOut);

  // 3. New Task Screen (Image 2) Actions
  if (newTaskBackBtn) newTaskBackBtn.addEventListener('click', closeTaskModal);
  if (newTaskCancelBtn) newTaskCancelBtn.addEventListener('click', closeTaskModal);

  // Due Date Pills
  if (pillDueToday) {
    pillDueToday.addEventListener('click', () => {
      const today = getTodayDateString();
      taskDueDate.value = today;
      syncDueDateUI(today);
    });
  }

  if (pillDueTomorrow) {
    pillDueTomorrow.addEventListener('click', () => {
      const tomorrow = getOffsetDateString(1);
      taskDueDate.value = tomorrow;
      syncDueDateUI(tomorrow);
    });
  }

  if (pillDueCustom) {
    pillDueCustom.addEventListener('click', () => {
      try {
        if (taskDueDate.showPicker) {
          taskDueDate.showPicker();
        } else {
          taskDueDate.click();
        }
      } catch (err) {
        taskDueDate.click();
      }
    });
  }

  // Interactive Date Picker Card Click Trigger
  if (datePickerCard) {
    datePickerCard.addEventListener('click', (e) => {
      if (e.target !== taskDueDate) {
        try {
          if (taskDueDate.showPicker) {
            taskDueDate.showPicker();
          } else {
            taskDueDate.click();
          }
        } catch (err) {
          taskDueDate.click();
        }
      }
    });
  }

  // Interactive Time Picker Card Click Trigger
  if (timePickerCard) {
    timePickerCard.addEventListener('click', (e) => {
      if (e.target !== taskDueTime) {
        try {
          if (taskDueTime.showPicker) {
            taskDueTime.showPicker();
          } else {
            taskDueTime.click();
          }
        } catch (err) {
          taskDueTime.click();
        }
      }
    });
  }

  if (taskDueDate) {
    taskDueDate.addEventListener('change', (e) => {
      syncDueDateUI(e.target.value);
    });
  }

  if (taskDueTime) {
    taskDueTime.addEventListener('change', () => {
      syncDueTimeUI();
    });
  }

  // Quick Time Preset Buttons
  if (timePresetBtns) {
    timePresetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const t = btn.dataset.time;
        if (taskDueTime) taskDueTime.value = t;
        syncDueTimeUI();
      });
    });
  }

  // Priority Segmented Buttons
  prioritySegmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.priority;
      setSelectedPriority(p);
    });
  });

  // Category / Project Pills
  catChipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      setSelectedCategory(cat);
    });
  });

  // Subtasks in New Task Screen
  if (addSubtaskBtn) addSubtaskBtn.addEventListener('click', addSubtaskToModal);
  if (newSubtaskInput) {
    newSubtaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSubtaskToModal();
      }
    });
  }

  // Form Submit
  if (taskForm) taskForm.addEventListener('submit', saveTaskFromModal);

  // Quick Add / Open Modal
  if (quickAddBtn) quickAddBtn.addEventListener('click', openAddTaskModal);
  if (mainFabBtn) mainFabBtn.addEventListener('click', openAddTaskModal);
  if (viewTasksAddBtn) viewTasksAddBtn.addEventListener('click', openAddTaskModal);

  // Modal Backdrop Click to close
  if (taskModal) {
    taskModal.addEventListener('click', (e) => {
      if (e.target === taskModal) closeTaskModal();
    });
  }

  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) deleteModal.classList.add('hidden');
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.add('hidden');
      pendingDeleteId = null;
    });
  }

  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDeleteTask);

  // Real-time Search input (Home)
  if (taskSearchInput) {
    taskSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (searchQuery) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
      renderTaskList(taskListContainer);
    });
  }

  // Clear search button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      taskSearchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      renderTaskList(taskListContainer);
    });
  }

  // Search input (Tasks View)
  if (taskSearchInputSecondary) {
    taskSearchInputSecondary.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderTaskList(tasksViewListContainer);
    });
  }

  // Category Filter Pills (Home)
  if (categoryPillsContainer) {
    categoryPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.cat-pill');
      if (!pill) return;

      categoryPillsContainer.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      renderTaskList(taskListContainer);
    });
  }

  // Status Filter Chips
  statusFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      statusFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeStatus = chip.dataset.status;
      if (currentListHeading) currentListHeading.textContent = chip.textContent;
      renderTaskList(taskListContainer);
    });
  });

  // Overview Stat Cards click-to-filter
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter;
      if (filter) {
        statusFilterChips.forEach(c => {
          if (c.dataset.status === filter) {
            c.click();
          }
        });
      }
    });
  });

  // Notifications Bell dropdown toggle
  if (notifBellBtn) {
    notifBellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', (e) => {
    if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBellBtn) {
      notifDropdown.classList.add('hidden');
    }
  });

  if (clearNotifsBtn) {
    clearNotifsBtn.addEventListener('click', () => {
      if (notifBadge) notifBadge.classList.add('hidden');
      if (notifList) notifList.innerHTML = `<li class="notif-item"><span>All caught up! No notifications.</span></li>`;
      showToast('Notifications cleared');
    });
  }

  // User Avatar click in top bar -> toggle quick account dropdown
  if (userAvatarBtn && userNavDropdown) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userNavDropdown.classList.toggle('hidden');
    });
  }

  // Close user dropdown on outside click
  document.addEventListener('click', (e) => {
    if (userNavDropdown && !userNavDropdown.contains(e.target) && e.target !== userAvatarBtn) {
      userNavDropdown.classList.add('hidden');
    }
  });

  // User Quick Dropdown Navigation Items
  if (dropdownProfileBtn) {
    dropdownProfileBtn.addEventListener('click', () => {
      if (userNavDropdown) userNavDropdown.classList.add('hidden');
      switchView('viewProfile');
    });
  }

  if (dropdownTasksBtn) {
    dropdownTasksBtn.addEventListener('click', () => {
      if (userNavDropdown) userNavDropdown.classList.add('hidden');
      switchView('viewTasks');
    });
  }

  if (dropdownSettingsBtn) {
    dropdownSettingsBtn.addEventListener('click', () => {
      if (userNavDropdown) userNavDropdown.classList.add('hidden');
      switchView('viewSettings');
    });
  }

  if (dropdownSignOutBtn) {
    dropdownSignOutBtn.addEventListener('click', () => {
      if (userNavDropdown) userNavDropdown.classList.add('hidden');
      signOutUser();
    });
  }

  // Top Header Theme Switcher
  if (navThemeToggleBtn) {
    navThemeToggleBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      toggleDarkMode(!isCurrentlyDark);
    });
  }

  // Header Quick Search Pill Trigger & Keyboard Shortcut (Ctrl+K / Cmd+K)
  if (headerSearchPill) {
    headerSearchPill.addEventListener('click', () => {
      focusGlobalSearch();
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      focusGlobalSearch();
    }
  });

  // Sidebar User Card click -> open profile
  if (sidebarUserCard) {
    sidebarUserCard.addEventListener('click', () => {
      switchView('viewProfile');
    });
  }

  // Sidebar Quick Add button
  if (sidebarQuickAddBtn) {
    sidebarQuickAddBtn.addEventListener('click', openAddTaskModal);
  }

  // Desktop Sidebar Navigation items
  sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.dataset.target;
      switchView(targetView);
    });
  });

  // Profile Photo Upload triggers
  if (triggerUploadBtn && avatarFileInput) {
    triggerUploadBtn.addEventListener('click', () => {
      avatarFileInput.click();
    });
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleAvatarFileUpload(e.target.files[0]);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', handleRemovePhoto);
  }

  // Preset avatar buttons
  presetAvatarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      handlePresetAvatar(presetKey);
    });
  });

  // Profile details form submit
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = profileNameInput.value.trim();
      if (!nameVal) {
        showToast('Please enter your name');
        profileNameInput.focus();
        return;
      }
      userProfile.name = nameVal;
      userProfile.username = profileUsernameInput ? profileUsernameInput.value.trim() : '@user';
      userProfile.email = profileEmailInput ? profileEmailInput.value.trim() : 'user@taskflow.io';
      userProfile.role = profileRoleInput ? profileRoleInput.value.trim() : 'Productivity Champion';
      userProfile.bio = profileBioInput ? profileBioInput.value.trim() : '';

      saveUserProfile();
      renderUserProfile();
      showToast('Profile updated successfully! ✨');
    });
  }

  // Sign out buttons across Settings & Profile
  if (profileSignOutBtn) {
    profileSignOutBtn.addEventListener('click', signOutUser);
  }

  if (settingsSignOutBtn) {
    settingsSignOutBtn.addEventListener('click', signOutUser);
  }

  // Bottom Navigation item clicks
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.dataset.target;
      switchView(targetView);
    });
  });

  // Settings Actions
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      toggleDarkMode(e.target.checked);
    });
  }

  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const prevCount = tasks.length;
      tasks = tasks.filter(t => !t.completed);
      saveTasks();
      renderAll();
      showToast(`Cleared ${prevCount - tasks.length} completed tasks 🧹`);
    });
  }

  if (clearAllTasksBtn) {
    clearAllTasksBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
        tasks = [];
        saveTasks();
        renderAll();
        showToast('All tasks cleared 🗑️');
      }
    });
  }

  if (loadSampleDataBtn) {
    loadSampleDataBtn.addEventListener('click', () => {
      tasks = [...DEFAULT_TASKS];
      saveTasks();
      renderAll();
      showToast('Sample tasks loaded! 🌟');
    });
  }

  if (relaunchOnboardingBtn) {
    relaunchOnboardingBtn.addEventListener('click', () => {
      showOnboarding();
    });
  }
}

// Global search focus trigger with smooth highlight
function focusGlobalSearch() {
  switchView('viewHome');
  if (taskSearchInput) {
    taskSearchInput.focus();
    taskSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const wrapper = taskSearchInput.parentElement;
    if (wrapper) {
      wrapper.classList.add('search-pulse-highlight');
      setTimeout(() => {
        wrapper.classList.remove('search-pulse-highlight');
      }, 1200);
    }
  }
}

// User sign out handler
function signOutUser() {
  setCurrentUser(null);
  showSignIn();
  showToast('Signed out successfully 👋');
}

// ==================== VIEW SWITCHING & CONTEXT HEADER ====================
function switchView(viewId) {
  // Update mobile nav tabs
  navItems.forEach(item => {
    if (item.dataset.target === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update desktop sidebar nav tabs
  sidebarNavItems.forEach(item => {
    if (item.dataset.target === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Show target view
  appViews.forEach(view => {
    if (view.id === viewId) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Update Header Context & Breadcrumbs
  updateHeaderContext(viewId);

  // Refresh view specific data if needed
  if (viewId === 'viewTasks') {
    renderTaskList(tasksViewListContainer);
  } else if (viewId === 'viewCategories') {
    renderCategoriesMatrix();
  } else if (viewId === 'viewProfile') {
    renderUserProfile();
  }
}

/**
 * Updates top navigation bar contextual titles, breadcrumb paths, and subtitles
 */
function updateHeaderContext(viewId) {
  const pendingCount = tasks.filter(t => !t.completed).length;
  const firstName = (userProfile.name || 'User').split(' ')[0];

  const hour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
  else if (hour >= 17 || hour < 4) timeGreeting = 'Good Evening';

  switch (viewId) {
    case 'viewHome':
      if (headerBreadcrumbCurrent) headerBreadcrumbCurrent.textContent = 'Dashboard';
      if (mobileHeaderViewPill) mobileHeaderViewPill.textContent = 'Dashboard';
      if (headerContextTitle) headerContextTitle.textContent = `${timeGreeting}, ${firstName} 👋`;
      if (headerContextSubtitle) headerContextSubtitle.textContent = pendingCount > 0
        ? `You have ${pendingCount} pending task${pendingCount > 1 ? 's' : ''} to accomplish today.`
        : "All caught up! Great work maintaining your streak.";
      break;
    case 'viewTasks':
      if (headerBreadcrumbCurrent) headerBreadcrumbCurrent.textContent = 'All Tasks';
      if (mobileHeaderViewPill) mobileHeaderViewPill.textContent = 'Tasks';
      if (headerContextTitle) headerContextTitle.textContent = 'Workspace Tasks 📋';
      if (headerContextSubtitle) headerContextSubtitle.textContent = `Managing ${tasks.length} total tasks across your workspace.`;
      break;
    case 'viewCategories':
      if (headerBreadcrumbCurrent) headerBreadcrumbCurrent.textContent = 'Categories';
      if (mobileHeaderViewPill) mobileHeaderViewPill.textContent = 'Categories';
      if (headerContextTitle) headerContextTitle.textContent = 'Categories & Projects 🗂️';
      if (headerContextSubtitle) headerContextSubtitle.textContent = 'Organize and track tasks by distinct focus areas.';
      break;
    case 'viewProfile':
      if (headerBreadcrumbCurrent) headerBreadcrumbCurrent.textContent = 'My Profile';
      if (mobileHeaderViewPill) mobileHeaderViewPill.textContent = 'Profile';
      if (headerContextTitle) headerContextTitle.textContent = 'Personal Profile & Stats 👤';
      if (headerContextSubtitle) headerContextSubtitle.textContent = 'Manage your identity, role, and lifetime productivity insights.';
      break;
    case 'viewSettings':
      if (headerBreadcrumbCurrent) headerBreadcrumbCurrent.textContent = 'Settings';
      if (mobileHeaderViewPill) mobileHeaderViewPill.textContent = 'Settings';
      if (headerContextTitle) headerContextTitle.textContent = 'Workspace Settings ⚙️';
      if (headerContextSubtitle) headerContextSubtitle.textContent = 'Configure preferences, theme styles, and task storage.';
      break;
  }
}

// ==================== MODAL HELPERS ====================
function openAddTaskModal() {
  taskForm.reset();
  editTaskId.value = '';
  if (modalTitle) modalTitle.textContent = 'New Task';
  if (saveTaskBtnText) saveTaskBtnText.textContent = 'Create Task';
  
  const today = getTodayDateString();
  taskDueDate.value = today;
  taskDueTime.value = '17:00';
  syncDueDateUI(today);

  setSelectedPriority('High');
  setSelectedCategory('Product Design');
  currentModalSubtasks = [];
  renderSubtasksInModal();
  
  if (titleError) titleError.classList.add('hidden');
  taskModal.classList.remove('hidden');
  taskTitleInput.focus();
}

function closeTaskModal() {
  taskModal.classList.add('hidden');
}

// ==================== TOAST COMPONENT ====================
let toastTimer = null;
function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.textContent = message;
  toastNotification.classList.remove('hidden');
  toastTimer = setTimeout(() => {
    toastNotification.classList.add('hidden');
  }, 2800);
}

// ==================== DATE & FORMAT UTILS ====================
function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getOffsetDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function formatTaskDue(dateStr, timeStr) {
  if (!dateStr) return { text: 'No date', class: '' };

  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  // Format 24h time to 12h AM/PM
  let formattedTime = '';
  if (timeStr) {
    const [h, m] = timeStr.split(':');
    const hours = parseInt(h);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours % 12 || 12;
    formattedTime = ` • ${displayH}:${m} ${suffix}`;
  }

  if (dateStr === todayStr) {
    return { text: `Today${formattedTime}`, class: 'is-today' };
  } else if (dateStr === tomorrowStr) {
    return { text: `Tomorrow${formattedTime}`, class: '' };
  } else if (dateStr < todayStr) {
    return { text: `Overdue (${dateStr})`, class: 'is-overdue' };
  } else {
    // Custom formatted date
    const parts = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parseInt(parts[1]) - 1];
    return { text: `${month} ${parseInt(parts[2])}${formattedTime}`, class: '' };
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
