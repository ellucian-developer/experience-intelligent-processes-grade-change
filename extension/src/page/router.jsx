import PropTypes from 'prop-types';
import React from "react";
import {
    Route,
    BrowserRouter as Router,
    Switch
} from "react-router-dom";
import { withIntl } from '../i18n/ReactIntlProviderWrapper';
import FacultyGradeChange from "./FacultyGradeChange";

const RouterPage = (props) => {
    return (
        <Router basename={props.pageInfo.basePath}>
            <Switch>
                <Route path="/">
                    <FacultyGradeChange {...props} />
                </Route>
            </Switch>
        </Router>
    );
};

RouterPage.propTypes = {
    pageInfo: PropTypes.object
};

export default withIntl(RouterPage);