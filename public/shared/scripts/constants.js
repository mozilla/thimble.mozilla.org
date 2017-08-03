module.exports = {
  ANONYMOUS_USER_FOLDER: "/.anonymous/projects",
  PROJECT_META_KEY: "thimble-project-meta",
  SYNC_OPERATION_UPDATE: "update",
  SYNC_OPERATION_DELETE: "delete",
  SYNC_OPERATION_RENAME_FOLDER: "rename-folder",
  // Default amount of time (ms) to wait between successful AJAX operations
  AJAX_DEFAULT_DELAY_MS: 10,
  // Default timeout period for AJAX requests so .fail() always gets called
  AJAX_DEFAULT_TIMEOUT_MS: 30 * 1000,
  // Timer for how often to empty the sync queue if not explicitly asked to do so
  AUTOSYNC_INTERVAL_MS: 60 * 1000,
  // Base unit of MS to apply to each backoff exponent period
  BACKOFF_BASE_MS: 200,
  // Maximum delay to backoff between failed network requests
  BACKOFF_MAX_DELAY_MS: 20 * 1000,
  CACHE_KEY_PREFIX: "thimble-cache-key-"
};
