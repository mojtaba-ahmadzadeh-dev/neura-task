export enum AuthMessage {
  // Success Messages
  OTP_SENT_SUCCESS = "کد تأیید با موفقیت ارسال شد",
  OTP_VERIFIED_SUCCESS = "کد تأیید با موفقیت تأیید شد",
  EMAIL_VERIFIED_SUCCESS = "ایمیل با موفقیت تایید شد",
  // Error Messages
  PHONE_AND_CODE_REQUIRED = "شماره تلفن و کد تأیید الزامی است",
  USER_NOT_FOUND = "کاربر یافت نشد",
  OTP_NOT_FOUND = "کد تأیید یافت نشد",
  UserExists = "کاربری با این اطلاعات قبلاً ثبت شده است",
  INVALID_OTP = "کد تأیید اشتباه است",
  OTP_EXPIRED = "کد تأیید منقضی شده است",
  VERIFICATION_ERROR = "خطا در تأیید کد",
  TryAgain = "دوباره تلاش کنید",
  LoginAgain = "مجددا وارد حساب کاربری خود شوید",
  LOGIN_IS_REQUIRED = "وارد حساب کاربری خود شوید",
  EmailAlreadyVerified = "ایمیل قبلاً تایید شده است",
  OtpExpired = "کد تایید منقضی شده است",
  InvalidOtp = "کد تایید نامعتبر است",
}

export enum RbacMessages {
  ROLE_NOT_FOUND = "نقش مورد نظر پیدا نشد",
  PERMISSION_NOT_FOUND = "دسترسی مورد نظر پیدا نشد",
  PERMISSION_ALREADY_ASSIGNED = "این دسترسی قبلاً به نقش مورد نظر اختصاص داده شده است",
  PERMISSION_ASSIGNED_SUCCESSFULLY = "دسترسی با موفقیت به نقش اختصاص داده شد",
  PERMISSION_REMOVED_SUCCESSFULLY = "دسترسی با موفقیت از نقش حذف شد",
  ROLE_CREATED_SUCCESSFULLY = "نقش جدید با موفقیت ساخته شد",
  ROLE_UPDATED_SUCCESSFULLY = "نقش با موفقیت به‌روزرسانی شد",
  ROLE_DELETED_SUCCESSFULLY = "نقش با موفقیت حذف شد",
  ACCESS_DENIED = "شما دسترسی لازم برای این عملیات را ندارید",
  ALREADY_PERMISSION = "این دسترسی قبلا به نقش مورد نظر اختصاص داده شده است",
  NOTFOUND_ROLE = "نقش مورد نظر یافت نشد",
  NOTFOUND_PERMISSION = "دسترسی مورد نظر یافت نشد",
  PERMISSION_ALREADY_EXISTS = "این دسترسی قبلاً وجود دارد",
  UNAUTHORIZED = "لطفا ابتدا وارد شوید",
  INVALID_TOKEN = "توکن نامعتبر یا منقضی شده است",
  INVALID_TOKEN_PAYLOAD = "اطلاعات توکن نامعتبر است",
  USER_NOT_FOUND = "کاربر یافت نشد",
  FORBIDDEN = "شما دسترسی به این عملیات ندارید",
}

export enum TaskMessage {
  // Success Messages
  TASK_CREATED_SUCCESSFULLY = "تسک با موفقیت ایجاد شد",
  TASK_UPDATED_SUCCESSFULLY = "تسک با موفقیت به‌روزرسانی شد",
  TASK_DELETED_SUCCESSFULLY = "تسک با موفقیت حذف شد",
  TASK_FETCHED_SUCCESSFULLY = "تسک با موفقیت دریافت شد",
  TASKS_FETCHED_SUCCESSFULLY = "لیست تسک‌ها با موفقیت دریافت شد",
  TASK_STATUS_UPDATED = "وضعیت تسک با موفقیت به‌روزرسانی شد",
  TASK_PRIORITY_UPDATED = "اولویت تسک با موفقیت به‌روزرسانی شد",
  TASK_ASSIGNED_SUCCESSFULLY = "تسک با موفقیت به کاربر اختصاص داده شد",
  // Error Messages
  TASK_NOT_FOUND = "تسک مورد نظر پیدا نشد",
  TASK_ALREADY_EXISTS = "تسکی با این عنوان قبلاً وجود دارد",
  INVALID_TASK_STATUS = "وضعیت تسک نامعتبر است",
  INVALID_TASK_PRIORITY = "اولویت تسک نامعتبر است",
  TASK_DUE_DATE_INVALID = "تاریخ سررسید نامعتبر است",
  TASK_TITLE_REQUIRED = "عنوان تسک الزامی است",
  TASK_ASSIGNEE_NOT_FOUND = "کاربر assignee مورد نظر یافت نشد",
  CANNOT_UPDATE_COMPLETED_TASK = "امکان به‌روزرسانی تسک انجام‌شده وجود ندارد",
  CANNOT_DELETE_COMPLETED_TASK = "امکان حذف تسک انجام‌شده وجود ندارد",
  TASK_ALREADY_COMPLETED = "این تسک قبلاً انجام شده است",
}

export enum ProjectMessages {
  USER_UNAUTHORIZED = "کاربر احراز هویت نشده است",
  USER_NOT_FOUND = "کاربر یافت نشد",
  WORKSPACE_NOT_FOUND = "ورک‌اسپیس یافت نشد",
  PROJECT_NOT_FOUND = "پروژه یافت نشد",
  PROJECT_CREATED_SUCCESSFULLY = "پروژه با موفقیت ایجاد شد",
  PROJECT_UPDATED_SUCCESSFULLY = "پروژه با موفقیت به‌روزرسانی شد",
  PROJECT_DELETED_SUCCESSFULLY = "پروژه با موفقیت حذف شد",
  ERROR_CREATING_PROJECT = "خطا در ایجاد پروژه",
  ERROR_UPDATING_PROJECT = "خطا در ویرایش پروژه",
  ERROR_DELETING_PROJECT = "خطا در حذف پروژه",
  ERROR_FETCHING_PROJECT = "خطا در دریافت پروژه",
  ERROR_FETCHING_PROJECTS = "خطا در دریافت لیست پروژه‌ها",
  INVALID_DATA = "داده‌های ارسالی نامعتبر است",
}

export enum CommentMessage {
  // Success Messages
  COMMENT_CREATED_SUCCESSFULLY = "کامنت با موفقیت ایجاد شد",
  COMMENT_UPDATED_SUCCESSFULLY = "کامنت با موفقیت به‌روزرسانی شد",
  COMMENT_DELETED_SUCCESSFULLY = "کامنت با موفقیت حذف شد",
  COMMENT_FETCHED_SUCCESSFULLY = "کامنت با موفقیت دریافت شد",
  COMMENTS_FETCHED_SUCCESSFULLY = "لیست کامنت‌ها با موفقیت دریافت شد",
  COMMENT_ACCEPTED_SUCCESSFULLY = "کامنت با موفقیت تایید شد",
  COMMENT_REJECTED_SUCCESSFULLY = "تایید کامنت لغو شد",
  // Error Messages
  USER_UNAUTHORIZED = "کاربر احراز هویت نشده است",
  TASK_NOT_FOUND = "تسک مورد نظر پیدا نشد",
  COMMENT_NOT_FOUND = "کامنت مورد نظر پیدا نشد",
  PARENT_COMMENT_NOT_FOUND = "کامنت والد پیدا نشد",
  ERROR_CREATING_COMMENT = "خطا در ایجاد کامنت",
  ERROR_UPDATING_COMMENT = "خطا در ویرایش کامنت",
  ERROR_DELETING_COMMENT = "خطا در حذف کامنت",
}
