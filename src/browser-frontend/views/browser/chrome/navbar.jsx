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

import React, { PureComponent, PropTypes } from 'react';
import CSSModules from 'react-css-modules';

import Styles from './navbar.css';
import LocationBar from './navbar/locationbar';
import NavigationButtons from './navbar/navigation-buttons';
import ToolbarButtons from './navbar/toolbar-buttons';

@CSSModules(Styles, {
  allowMultiple: true,
})
export default class NavBar extends PureComponent {
  render() {
    return (
      <div styleName="navbar">
        <NavigationButtons pageId={this.props.pageId} />
        <LocationBar pageId={this.props.pageId} />
        <ToolbarButtons />
      </div>
    );
  }
}

NavBar.propTypes = {
  pageId: PropTypes.string.isRequired,
};
