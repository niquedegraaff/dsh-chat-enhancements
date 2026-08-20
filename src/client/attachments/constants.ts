import { LOCALE_NS, PLUGIN_NAME } from '../../shared/constants.ts'

/** Locale namespace owned by this plugin. */
export const NS = LOCALE_NS

/** Input-trigger / reference source name. */
export const SOURCE_NAME = PLUGIN_NAME

/** Style tag id used to avoid double-injecting the stylesheet. */
export const STYLE_TAG = `${PLUGIN_NAME}/style.css`
