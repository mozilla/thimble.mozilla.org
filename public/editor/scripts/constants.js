define(function() {
  return {
    ANONYMOUS_USER_FOLDER: "/.anonymous/projects",
    PROJECT_META_KEY: "thimble-project-meta",
    SYNC_OPERATION_UPDATE: "update",
    SYNC_OPERATION_DELETE: "delete",
    // Timer for how often to empty the sync queue if not explicitly asked to do so
    SYNC_TIMEOUT_MS: 10 * 1000,
    CACHE_KEY_PREFIX: "thimble-cache-key-"
  };
});
