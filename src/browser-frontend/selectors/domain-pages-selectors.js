/*
Copyright 2016 Mozilla

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
*/

import * as RootSelectors from './root-selectors';

export function getAppPagesDomainState(state) {
  return RootSelectors.getAppDomainState(state).get('pages');
}

export function getAllPages(state) {
  return getAppPagesDomainState(state).get('pagesDomainStateByPageId');
}

export function getPageIdsInCreationOrder(state) {
  return getAppPagesDomainState(state).get('pageIds');
}

// Domain page properties getters.

export function getPageDomainStateById(state, pageId) {
  return getAllPages(state).get(pageId);
}

export function getPageOwnerId(state, pageId) {
  return getPageDomainStateById(state, pageId).get('ownerId');
}

export function getPageUrl(state, pageId) {
  return getPageDomainStateById(state, pageId).get('url');
}

export function getPageTransient(state, pageId) {
  return getPageDomainStateById(state, pageId).get('transient');
}

// Domain page transient properties getters.

export function getPageLoadState(state, pageId) {
  return getPageTransient(state, pageId).get('loadState');
}

export function getPageTitle(state, pageId) {
  return getPageTransient(state, pageId).get('title');
}

export function getPageFavicons(state, pageId) {
  return getPageTransient(state, pageId).get('favicons');
}

export function getPageBookmarkedState(state, pageId) {
  return getPageTransient(state, pageId).get('bookmarked');
}
