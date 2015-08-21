define(function() {
  return {
    ANONYMOUS_USER_FOLDER: "/.anonymous/projects",
    PROJECT_META_KEY: "thimble-project-meta",
    LOCK_EXPIRY_MS: 5000, // 1000ms * 5s
    LOCK_PREFIX: "bramble-lock-"
  };
});
