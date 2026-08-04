export const PermissionsList = {
  CREATE_COURSE: 'create:course',
  FIND_COURSES: 'find:courses',
  FIND_ONE_COURSE: 'findOne:course',
  UPDATE_COURSE: 'update:course',
  REMOVE_COURSE: 'remove:course',

  CREATE_DISCOUNT: 'create:discount',
  FIND_DISCOUNT: 'find:discount',
  FIND_ONE_DISCOUNT: 'findOne:discount',
  REMOVE_DISCOUNT: 'remove:discount',

  CREATE_BLOG: 'create:blog',
  UPDATE_BLOG: 'update:blog',
  REMOVE_BLOG: 'remove:blog',

  CREATE_CATEGORY: 'create:category',
  UPDATE_CATEGORY: 'update:category',
  REMOVE_CATEGORY: 'remove:category',

  CREATE_ROLE: 'role:create',
  CREATE_PERMISSION: 'create:permission',

  CREATE_CHAPTER: 'create:chapter',
  UPDATE_CHAPTER: 'update:chapter',
  REMOVE_CHAPTER: 'remove:chapter',

  ADD_TO_BASKET: 'add:basket',
  APPLY_DISCOUNT_TO_BASKET: 'apply_discount_for_basket',
  REMOVE_DISCOUNT_FROM_BASKET: 'remove:discount_from_basket',
} as const;

export type PermissionType = (typeof PermissionsList)[keyof typeof PermissionsList];
