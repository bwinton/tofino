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

import { delay } from 'redux-saga';
import { takeEvery, call, put, select } from 'redux-saga/effects';

import * as Endpoints from '../constants/endpoints';
import * as Helpers from './helpers';
import WebContentsEffects from '../actions/effects/webcontents-effects';
import ProfileEffects from '../actions/effects/profile-effects';
import PagesModelActions from '../actions/model/pages-model-actions';
import DomainPageTransientModel from '../model/domain-page-transient-model';
import * as DomainPagesSelectors from '../selectors/domain-pages-selectors';

function* onPageDidMount({ payload: { pageId } }) {
  const url = yield select(DomainPagesSelectors.getPageUrl, pageId);
  yield put(WebContentsEffects.commands.navigatePageTo({ pageId, url }));
}

function* onPageDidStartLoading({ payload: { pageId } }) {
  yield put(PagesModelActions.setPageLoadState({
    pageId,
    loadState: DomainPageTransientModel.LOAD_STATES.LOADING,
  }));
}

function* onPageDidStopLoading({ payload: { pageId } }) {
  yield put(PagesModelActions.setPageLoadState({
    pageId,
    loadState: DomainPageTransientModel.LOAD_STATES.LOADED,
  }));

  const url = yield select(DomainPagesSelectors.getPageUrl, pageId);
  if (url === Endpoints.BLANK_PAGE) {
    return;
  }

  // Show the tab loaded flash, but not on about:blank pages.
  yield put(PagesModelActions.tabbar.setTabLoadedAnimationEnabled({ pageId }));
  yield call(delay, 400);

  // If the page still exists at this point, hide the tab loaded flash.
  if (yield select(DomainPagesSelectors.getPageDomainStateById, pageId)) {
    yield put(PagesModelActions.tabbar.setTabLoadedAnimationDisabled({ pageId }));
  }
}

function* onPageDidSucceedLoad() {
  // TOOD
}

function* onPageDidFailLoad() {
  // TOOD
}

function* onPageDomReady({ payload: { pageId } }) {
  // Store page visit in profile history during the `onPageDomReady` event,
  // instead of `onPageDidNavigate`, because we prefer having title and favicons
  // available. Note that we can't do it in the `onPageTitleSet` event, nor the
  // `onPageFaviconsSet` event, because not all pages have titles or favicons,
  // in which case those listeners never get called.
  yield put(ProfileEffects.commands.notifyPageVisited({ pageId }));
}

function* onPageTitleSet({ payload: { pageId, title } }) {
  yield put(PagesModelActions.setPageTitle({
    pageId,
    title,
  }));
}

function* onPageFaviconsSet({ payload: { pageId, favicons } }) {
  yield put(PagesModelActions.setPageFavicons({
    pageId,
    favicons,
  }));
}

function* onPageDidNavigate({ payload: { pageId, url } }) {
  yield* Helpers.updateNavigationButtonsEnabledState({ payload: { pageId } });

  yield put(PagesModelActions.setPageUrl({
    pageId,
    url,
  }));
  yield put(PagesModelActions.navbar.setLocationInputBarValue({
    pageId,
    value: url === Endpoints.BLANK_PAGE ? '' : url,
  }));
}

function* onPageDidNavigateInternal({ payload: { pageId, url, isMainFrame } }) {
  if (isMainFrame) {
    // Update relevant domain and ui state when internal top-level page
    // navigations occur (e.g. location hash changes).
    yield* onPageDidNavigate({ payload: { pageId, url } });

    // Store page visit in profile history on internal navigations as well.
    yield put(ProfileEffects.commands.notifyPageVisited({ pageId }));
  }
}

function* onPageDidNavigateToNewWindow({ payload: { parentId, url } }) {
  yield put(PagesModelActions.addPage({ parentId, url, background: false }));

  // Prevent the deselect animation of the parent tab when opening a child tab.
  yield put(PagesModelActions.tabbar.setAllTabAnimationsDisabled({ pageId: parentId }));
  yield call(delay, 200);

  // If the page still exists at this point, allow animations again.
  if (yield select(DomainPagesSelectors.getPageDomainStateById, parentId)) {
    yield put(PagesModelActions.tabbar.setAllTabAnimationsEnabled({ pageId: parentId }));
  }
}

export default function* () {
  yield [
    takeEvery(WebContentsEffects.events.pageDidMount, onPageDidMount),
    takeEvery(WebContentsEffects.events.pageDidStartLoading, onPageDidStartLoading),
    takeEvery(WebContentsEffects.events.pageDidStopLoading, onPageDidStopLoading),
    takeEvery(WebContentsEffects.events.pageDidSucceedLoad, onPageDidSucceedLoad),
    takeEvery(WebContentsEffects.events.pageDidFailLoad, onPageDidFailLoad),
    takeEvery(WebContentsEffects.events.pageDomReady, onPageDomReady),
    takeEvery(WebContentsEffects.events.pageTitleSet, onPageTitleSet),
    takeEvery(WebContentsEffects.events.pageFaviconsSet, onPageFaviconsSet),
    takeEvery(WebContentsEffects.events.pageDidNavigate, onPageDidNavigate),
    takeEvery(WebContentsEffects.events.pageDidNavigateInternal, onPageDidNavigateInternal),
    takeEvery(WebContentsEffects.events.pageDidNavigateToNewWindow, onPageDidNavigateToNewWindow),
  ];
}
