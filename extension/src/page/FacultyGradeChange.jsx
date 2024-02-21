/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */

import jwtDecode from 'jwt-decode';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { Edit, ListView } from '@ellucian/ds-icons/lib';
import { MultiDataQueryProvider, useDataQuery, userTokenDataConnectQuery } from '@ellucian/experience-extension-extras';
import { useData, usePageControl, useUserInfo } from '@ellucian/experience-extension-utils';
import { Button, CircularProgress, Divider, DropdownTypeahead, DropdownTypeaheadItem, Grid, Snackbar, TextField, Typography, makeStyles } from '@ellucian/react-design-system/core';
import { colorCtaIrisActive, colorCtaIrisBase, colorCtaIrisTint, colorTextNeutral250, colorTextNeutral400, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';

import { resourceName as academicPeriodResource, fetchAcademicPeriods } from './data/academic-periods';
import { resourceName as attendanceResource, fetchClassAttendanceRoster } from './data/class-attendance-roster';
import { resourceName as courseMaintenanceResource, fetchCourseMaintenance } from './data/course-maintenance';
import { resourceName as facultyResource, fetchFacultyAssignment } from './data/faculty-assignment';
import { fetchStudentInformation, resourceName as studentResource } from './data/student-persons';
import { fetchStudentTranscriptGrades, resourceName as studentTranscriptGradesResource } from './data/student-transcript-grades';

import useForm from './hooks/useForm';
let facultyErpID;

const FacultyGradeChange = () => {
    const intl = useIntl();
    const classes = useStyles();
    const { setPageTitle } = usePageControl();
    const userInfo = useUserInfo();
    const { getExtensionJwt } = useData();
    const { data: courses = [], isLoading: isFetchingCourse, setEnabled: setCourseQueryStatus, setQueryKeys: setQueryForCourse } = useDataQuery(facultyResource);
    const { data: students = [], isLoading: isFetchingStudent, setEnabled: setStudentQueryStatus, setQueryKeys: setQueryForStudent } = useDataQuery(attendanceResource);
    const { data: student = [], setEnabled: setStudentIdStatus, setQueryKeys: setQueryForStudentId } = useDataQuery(studentResource);
    const { data: courseMaintenance = [], isLoading: isFetchingCourseMaintenance, setEnabled: setCourseMaintenanceStatus, setQueryKeys: setQueryForCourseMaintenance } = useDataQuery(courseMaintenanceResource);
    const { data: changeCodes = [], isLoading: isFetchingCodes } = useDataQuery('get-grade-change-reasons');
    const { data: termCodes = [], isLoading: isFetchingTermCodes } = useDataQuery('get-term-codes-maestro');
    const { data: academicPeriods = [], setEnabled: setAcademicPeriodsStatus, setQueryKeys: setQueryForAcademicPeriods } = useDataQuery(academicPeriodResource);
    const { data: studentGrade = [], setEnabled: setStudentTranscriptGradessStatus, setQueryKeys: setQueryForStudentTranscriptGrades } = useDataQuery(studentTranscriptGradesResource);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarConfig, setSnackbarConfig] = useState({
        open: false,
        message: ''
    });

    const { data, setData, reset, post, errors } = useForm({
        term: "",
        facultyID: "",
        facultyName: "",
        studentID: "",
        studentName: "",
        courseID: "",
        courseName: "",
        oldGrade: "",
        newGrade: "",
        facultyComment: "",
        gradeId: "",
        studentGuid: "",
        academicPeriodId: "",
        gradeChangeCode: "",
        gradeRowId: ""
    }, [
        'term', 'courseID', 'studentID',
        'oldGrade', 'newGrade', 'gradeChangeCode'
    ])

    useEffect(() => {
        (async () => {
            if (!data.facultyID) {
                const token = await getExtensionJwt();
                const decoded = jwtDecode(token);

                facultyErpID = decoded.user.erpId;
                const facultyName = userInfo.firstName;
                setData({ facultyID: facultyErpID, facultyName })
            }
        })();
    }, [userInfo, data.facultyID]);

    useEffect(() => {
        if (academicPeriods.length) {
            const academicPeriodId = academicPeriods[0].id;
            setData({ academicPeriodId })
        }
    }, [academicPeriods, data.term]);

    useEffect(() => {
        if (data.term && data.term.length > 5) {
            setQueryForCourse({
                keyblocTermCodeEff: data.term,
                id: facultyErpID
            });
            setCourseQueryStatus(true)

            setQueryForAcademicPeriods({ code: data.term });
            setAcademicPeriodsStatus(true)
        }
    }, [data.term, facultyErpID]);

    useEffect(() => {
        setQueryForCourseMaintenance({ id: data.studentID, keyblckTermCode: data.term, crn: data.courseID });
        setCourseMaintenanceStatus(true)

        if (data.studentID) {
            setQueryForStudentId({ bannerIds: [data.studentID] });
            setStudentIdStatus(true)
        }
    }, [data.studentID]);

    useEffect(() => {
        if (data.studentGuid && data.academicPeriodId) {
            setQueryForStudentTranscriptGrades({ studentGuid: data.studentGuid, academicPeriodId: data.academicPeriodId });
            setStudentTranscriptGradessStatus(true)
        }
    }, [data.studentGuid, data.academicPeriodId]);

    useEffect(() => {
        if (courseMaintenance.length && data.studentID.length) {
            const rolledGrades = courseMaintenance[0]?.SHRTCKG;
            if (rolledGrades.length && data.oldGrade !== rolledGrades[0].grdeCodeFinal) {
                setData({ oldGrade: rolledGrades[0].grdeCodeFinal })
            }
        }
    }, [data.studentID, courseMaintenance]);

    const setStudentInformation = (studentID) => {
        if (studentID) {
            const student = students.find(student => student.spridenId === studentID) || {};
            if (Object.keys(student).length) {
                setData({ studentID, studentName: student.spridenCurrName, oldGrade: '' })
            } else {
                setData({ studentID: '', studentName: '', oldGrade: '' })
            }
        }
    }

    useEffect(() => {
        if (studentGrade.length) {
            const gradeRowId = studentGrade[0].id;
            setData({ gradeRowId })
        }
    }, [studentGrade, data.studentID]);

    useEffect(() => {
        if (data.term && data.courseID) {
            const course = courses.find(course => course.crn === data.courseID) || {};
            if (Object.keys(course).length) {
                setData({ courseName: course.subjCode });
            }
            setQueryForStudent({ ssbsectTermCodet: data.term, ssbsectCrnt: data.courseID });
            setStudentQueryStatus(true)
        }
    }, [data.term, data.courseID]);

    useEffect(() => {
        if (data.gradeId) {
            const grade = grades.find(grade => grade.id === data.gradeId) || "";
            if (Object.keys(grade).length) {
                setData({ newGrade: grade.value });
            }
        }
    }, [data.gradeId]);

    useEffect(() => {
        if (student.length) {
            setData({ studentGuid: student[0].id })
        }
    }, [student, data.studentID]);

    setPageTitle(intl.formatMessage({ id: 'card.name' }));

    const termCodesItems = useMemo(() => {
        return termCodes.map(data => <DropdownTypeaheadItem key={data.code} value={data?.code} label={data.code} />);
    }, [termCodes]);

    const courseItems = useMemo(() => {
        return courses.map(data => <DropdownTypeaheadItem key={data.crn} value={data?.crn} label={data.crn} />);
    }, [courses]);

    const studentItems = useMemo(() => {
        return students.map(data => <DropdownTypeaheadItem key={data.spridenId} value={data?.spridenId} label={data.spridenCurrName} />);
    }, [students]);

    const grades = [
        { id: "309ee8b1-40ea-41f9-842b-097c9c474955", value: "A++" },
        { id: "0f342821-6590-41cf-89d7-b7815ea140f6", value: "A" },
        { id: "1fd6e618-3c40-4777-8739-d73680149341", value: "A-" },
        { id: "04ecc0f0-782c-4aa4-a542-e8702fc8b77b", value: "B" },
        { id: "1ff6a45d-94df-4d3b-9998-c7d5c4c59ad4", value: "D" }
    ];

    const gradeItems = useMemo(() => {
        let availableGrades = grades;
        if (data.oldGrade) {
            availableGrades = availableGrades.filter(item => {
                return item.value !== data.oldGrade;
            });
        }
        return availableGrades.map(data => <DropdownTypeaheadItem key={data.value} value={data?.id} label={data.value} />);
    }, [data.oldGrade, grades]);

    const gradeChangeCodes = useMemo(() => {
        return changeCodes.map(data => <DropdownTypeaheadItem key={data.code} value={data?.id} label={data.title} />);
    }, [grades]);

    const submit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await post('workflow-instances');
        if (response) {
            setSnackbarConfig({
                open: true,
                message: intl.formatMessage({ id: 'messages.snackbarSuccess' })
            });
        } else {
            setSnackbarConfig({
                open: true,
                message: intl.formatMessage({ id: 'messages.snackbarFailure' })
            });
        }
        setIsLoading(false);
    }

    return (
        <>
            <div className={classes.card}>
                <Snackbar
                    open={snackbarConfig.open}
                    onClose={() => setSnackbarConfig({
                        open: false,
                        message: ''
                    })}
                    message={snackbarConfig.message}
                />
                <Divider className={classes.resetMargin} />
                <div className={classes.container}>
                    {/* Term & Course Information */}
                    <Grid container className={classes.gridContainer}>
                        <Grid item xs={12} lg={3}>
                            <div className={classes.sectionContainer}>
                                <div className={classes.iconBackground}>
                                    <ListView className={classes.icon} />
                                </div>
                                <div>
                                    <Typography variant="h3" className={classes.heading}>
                                        {intl.formatMessage({ id: 'home.courseInformation' })}
                                    </Typography>
                                    <Typography variant="p">
                                        {intl.formatMessage({ id: 'home.courseHelperText' })}
                                    </Typography>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} lg={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} lg={6} className={classes.relative}>
                                    {isFetchingTermCodes && <CircularProgress size={20} className={classes.isLoading} />}
                                    <DropdownTypeahead
                                        helperText={errors?.term}
                                        error={Boolean(errors?.term?.length)}
                                        id="term"
                                        label={isFetchingTermCodes ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.term' })}
                                        required={!isFetchingTermCodes}
                                        onChange={(term) => setData({ term })}
                                        value={data?.term}
                                        disabled={isFetchingTermCodes}
                                        fullWidth
                                    >
                                        {termCodesItems}
                                    </DropdownTypeahead>
                                </Grid>
                                <Grid item xs={12} lg={6} className={classes.relative}>
                                    {isFetchingCourse && <CircularProgress size={20} className={classes.isLoading} />}
                                    <DropdownTypeahead
                                        helperText={errors?.courseID}
                                        error={Boolean(errors?.courseID?.length)}
                                        id="courseID"
                                        label={isFetchingCourse ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.courseID' })}
                                        required={!isFetchingCourse}
                                        onChange={(courseID) => setData({ courseID })}
                                        value={data?.courseID}
                                        disabled={!data.term || isFetchingCourse}
                                        fullWidth
                                    >
                                        {courseItems}
                                    </DropdownTypeahead>
                                </Grid>
                                <Grid item xs={12} className={classes.relative}>
                                    {isFetchingStudent && <CircularProgress size={20} className={classes.isLoading} />}
                                    <DropdownTypeahead
                                        helperText={errors?.studentID}
                                        error={Boolean(errors?.studentID?.length)}
                                        id="studentID"
                                        value={data?.studentID}
                                        onChange={(studentID) => setStudentInformation(studentID)}
                                        disabled={!data.term || !data.courseID || isFetchingStudent}
                                        fullWidth
                                        label={isFetchingStudent ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.studentID' })}
                                        required={!isFetchingStudent}
                                    >
                                        {studentItems}
                                    </DropdownTypeahead>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Grade Information */}
                    <Grid container className={classes.gridContainer}>
                        <Grid item xs={12} lg={3}>
                            <div className={classes.sectionContainer}>
                                <div className={classes.iconBackground}>
                                    <Edit className={classes.icon} />
                                </div>
                                <div>
                                    <Typography variant="h3" className={classes.heading}>
                                        {intl.formatMessage({ id: 'home.gradeInformation' })}
                                    </Typography>
                                    <Typography variant="p">
                                        {intl.formatMessage({ id: 'home.gradeHelperText' })}
                                    </Typography>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} lg={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} lg={4} className={classes.relative}>
                                    {isFetchingCourseMaintenance && <CircularProgress size={20} className={classes.isLoading} />}
                                    <TextField
                                        helperText={errors?.oldGrade}
                                        error={Boolean(errors?.oldGrade?.length)}
                                        id={`oldGrade`}
                                        label={isFetchingCourseMaintenance ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.oldGrade' })}
                                        name="oldGrade"
                                        required
                                        value={data.oldGrade}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} lg={4} className={classes.relative}>
                                    <DropdownTypeahead
                                        helperText={errors?.newGrade}
                                        error={Boolean(errors?.newGrade?.length)}
                                        id="newGrade"
                                        label={intl.formatMessage({ id: 'fields.newGrade' })}
                                        value={data?.gradeId}
                                        onChange={(gradeId) => setData({ gradeId })}
                                        disabled={!data.term || !data.oldGrade}
                                        fullWidth
                                        required
                                    >
                                        {gradeItems}
                                    </DropdownTypeahead>
                                </Grid>
                                <Grid item xs={12} lg={4} className={classes.relative}>
                                    {isFetchingCodes && <CircularProgress size={20} className={classes.isLoading} />}
                                    <DropdownTypeahead
                                        helperText={errors?.gradeChangeCode}
                                        error={Boolean(errors?.gradeChangeCode?.length)}
                                        id="gradeChangeCode"
                                        label={isFetchingCodes ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.reasonForGradeChange' })}
                                        value={data?.gradeChangeCode}
                                        onChange={(gradeChangeCode) => setData({ gradeChangeCode })}
                                        disabled={isFetchingCodes}
                                        fullWidth
                                        required={!isFetchingCodes}
                                    >
                                        {gradeChangeCodes}
                                    </DropdownTypeahead>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id={`facultyComment`}
                                        label={intl.formatMessage({ id: 'fields.facultyComment' })}
                                        name="facultyComment"
                                        multiline
                                        fullWidth
                                        value={data.facultyComment}
                                        onChange={({ target: { value } }) => setData({ facultyComment: value })}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <div className={classes.ctaContainer}>
                        <Button
                            color="secondary"
                            onClick={reset}
                            className={classes.cta}
                        >
                            {intl.formatMessage({ id: 'fields.buttonReset' })}
                        </Button>
                        <Button
                            color="primary"
                            onClick={submit}
                            disabled={isLoading}
                            className={classes.cta}
                        >
                            {isLoading && <CircularProgress color="primary" size={20} className={classes.progress} />}
                            {isLoading ? intl.formatMessage({ id: 'fields.requesting' }) : intl.formatMessage({ id: 'fields.buttonCta' })}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

const useStyles = makeStyles(() => ({
    relative: {
        position: 'relative'
    },
    isLoading: {
        position: 'absolute',
        top: '24px',
        right: '50px',
        zIndex: 9
    },
    progress: {
        marginRight: spacing40
    },
    container: {
        padding: `1rem ${spacing40} 0`
    },
    sectionContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    iconBackground: {
        backgroundColor: colorCtaIrisTint,
        borderRadius: '100%',
        padding: spacing40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        color: colorCtaIrisBase,
        marginBottom: spacing40,
        marginRight: spacing40
    },
    gridContainer: {
        marginTop: `0 !important`,
        marginBottom: `0 !important`,
        padding: `${spacing40} 0 !important`,
        borderBottom: `1px solid ${colorTextNeutral400}`
    },
    heading: {
        color: colorCtaIrisBase
    },
    supportingText: {
        color: colorCtaIrisActive
    },
    resetMargin: {
        margin: '0 !important',
        backgroundColor: `${colorTextNeutral250} !important`
    },
    icon: { width: '20px', height: '20px', fill: colorCtaIrisBase },
    ctaContainer: {
        paddingTop: spacing40,
        display: 'flex',
        justifyContent: 'flex-end'
    },
    cta: {
        marginLeft: spacing40
    }
}));

function FacultyGradeChangeWithProviders() {
    const options = {
        queryParameters: { acceptVersion: '1' },
        queryFunction: userTokenDataConnectQuery
    }

    const config = [
        {
            ...options,
            resource: 'get-term-codes-maestro'
        }, {
            ...options,
            queryFunction: fetchFacultyAssignment,
            resource: facultyResource
        }, {
            ...options,
            queryFunction: fetchClassAttendanceRoster,
            resource: attendanceResource
        }, {
            ...options,
            queryFunction: fetchStudentInformation,
            resource: studentResource
        }, {
            ...options,
            queryFunction: fetchAcademicPeriods,
            resource: academicPeriodResource
        }, {
            ...options,
            resource: 'get-grade-change-reasons'
        }, {
            ...options,
            queryFunction: fetchStudentTranscriptGrades,
            resource: studentTranscriptGradesResource
        }, {
            ...options,
            queryFunction: fetchCourseMaintenance,
            resource: courseMaintenanceResource,
            cacheEnabled: false
        }
    ];

    return <MultiDataQueryProvider options={config}>
        <FacultyGradeChange />
    </MultiDataQueryProvider>
}

export default FacultyGradeChangeWithProviders;