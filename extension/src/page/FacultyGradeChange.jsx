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
import { fetchGradeChangeReasons, resourceName as gradeChangeReasonsResource } from './data/grade-change-reasons';
import { fetchGradeDefinitions, resourceName as gradeDefinitionResource } from './data/grade-definitions';
import { fetchPersons, resourceName as personsResource } from './data/persons';
import { fetchSectionRegistrations, resourceName as sectionRegistrationResource } from './data/section-registrations';
import { fetchSections, resourceName as sectionResource } from './data/sections';
import { fetchStudentTranscriptGrades, resourceName as studentTranscriptGradesResource } from './data/student-transcript-grades';

import useForm from './hooks/useForm';

const FacultyGradeChange = () => {
    const intl = useIntl();
    const classes = useStyles();
    const { setPageTitle } = usePageControl();
    const userInfo = useUserInfo();
    const { getExtensionJwt } = useData();
    const { data: sections = [], isLoading: isFetchingSection, dataError: sectionsError, setEnabled: setSectionQueryStatus, setQueryKeys: setQueryForSection } = useDataQuery(sectionResource);
    const { data: students = [], isLoading: isFetchingStudent, dataError: studentsError, setEnabled: setStudentQueryStatus, setQueryKeys: setQueryForStudent } = useDataQuery(sectionRegistrationResource);
    const { data: grades = [], isLoading: isFetchingGrades, dataError: gradesError, setEnabled: setGradeQueryStatus, setQueryKeys: setQueryForGrade } = useDataQuery(gradeDefinitionResource);
    const { data: changeCodes = [], isLoading: isFetchingCodes } = useDataQuery(gradeChangeReasonsResource);
    const { data: termCodes = [], isLoading: isFetchingTermCodes } = useDataQuery(academicPeriodResource);
    const { data: faculty = {}, isLoading: isFetchingFaculty, dataError: facultyError = {}, setEnabled: setFacultyStatus, setQueryKeys: setFacultyKeys } = useDataQuery(personsResource);
    const { data: studentGrade = [], isLoading: isFetchingStudentTranscriptGrade, dataError: studentGradeError, setEnabled: setStudentTranscriptGradesStatus, setQueryKeys: setQueryForStudentTranscriptGrades } = useDataQuery(studentTranscriptGradesResource);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarConfig, setSnackbarConfig] = useState({
        open: false,
        message: ''
    });

    const { data, setData, reset, post, errors } = useForm({
        term: "",
        facultyGuid: "",
        facultyID: "",
        facultyName: "",
        studentId: "",
        studentName: "",
        sectionId: "",
        sectionCode: "",
        oldGrade: "",
        newGrade: "",
        schemeId: "",
        facultyComment: "",
        gradeId: "",
        academicPeriodId: "",
        changeReasonId: "",
        gradeRowId: ""
    }, [
        'term', 'sectionId', 'studentId',
        'oldGrade', 'newGrade', 'changeReasonId'
    ])

    useEffect(() => {
        if (sectionsError && Object.keys(sectionsError).length > 0) {
            setSnackbarConfig({
                open: true,
                message: intl.formatMessage({ id: `errors.${sectionsError?.message}` })
            });
            return;
        }

        if (studentsError && Object.keys(studentsError).length > 0) {
            setSnackbarConfig({
                open: true,
                message: intl.formatMessage({ id: `errors.${studentsError?.message}` })
            });
            return;
        }

        if (gradesError && Object.keys(gradesError).length > 0) {
            setSnackbarConfig({
                open: true,
                message: intl.formatMessage({ id: `errors.${gradesError?.message}` })
            });
            return;
        }

        if (gradesError && Object.keys(gradesError).length > 0) {
            setSnackbarConfig({
                open: true,
                message: intl.formatMessage({ id: `errors.${gradesError?.message}` })
            });
            return;
        }

        if (studentGradeError && Object.keys(studentGradeError).length > 0) {
            setSnackbarConfig({
                open: true,
                message: intl.formatMessage({ id: `errors.${studentGradeError?.message}` })
            });
        }
    }, [sectionsError, studentsError, gradesError, studentGradeError]);

    useEffect(() => {
        (async () => {
            if (!data.facultyID) {
                const token = await getExtensionJwt();
                const decoded = jwtDecode(token);

                const facultyID = decoded.user.erpId;
                const facultyGuid = decoded.user.id;
                const facultyName = userInfo.firstName;
                setData({ facultyID, facultyName, facultyGuid });

                setFacultyKeys({ id: facultyGuid })
                setFacultyStatus(true);
            }
        })();
    }, [userInfo, data.facultyID]);

    useEffect(() => {
        if (Object.keys(faculty).length && !Object.keys(facultyError).length) {
            const { fullName } = faculty;
            setData({ facultyName: fullName });
        }
    }, [faculty, facultyError]);

    useEffect(() => {
        if (data.term) {
            const selectedTerm = termCodes.filter(item => item.code === data.term);
            if (selectedTerm.length) {
                const academicPeriodId = selectedTerm[0].id;
                setData({ academicPeriodId });
                setQueryForSection({
                    academicPeriodId,
                    instructorId: data.facultyGuid
                });
                setSectionQueryStatus(true);
            }

        }
    }, [data.term]);

    useEffect(() => {
        if (data.studentId && data.sectionId) {
            setQueryForStudentTranscriptGrades({ studentId: data.studentId, sectionId: data.sectionId });
            setStudentTranscriptGradesStatus(true)
        }
    }, [data.studentId, data.sectionId]);

    const setStudentInformation = (studentId) => {
        if (studentId) {
            const student = students.find(student => student.id === studentId) || {};
            if (Object.keys(student).length) {
                setData({ studentId: student.id, studentName: student.name })
            } else {
                setData({ studentId: '', studentName: '' })
            }
        }
    }

    useEffect(() => {
        if (Object.keys(studentGrade).length && data.studentId) {
            const record = studentGrade;
            setData({
                gradeRowId: record.id,
                oldGrade:  record.gradeInfo.grade.value
            });
        }
    }, [studentGrade, data.studentId]);

    useEffect(() => {
        if (data.term && data.sectionId) {
            const section = sections.find(section => section.id === data.sectionId) || {};
            if (Object.keys(section).length) {
                setData({
                    sectionCode: section.code,
                    schemeId: section.gradeScheme
                });
                setQueryForGrade({
                    schemeId: section.gradeScheme
                });
                setGradeQueryStatus(true);
            }
            setQueryForStudent({
                sectionId: data.sectionId
            });
            setStudentQueryStatus(true);

        }
    }, [data.term, data.sectionId]);

    setPageTitle(intl.formatMessage({ id: 'card.name' }));

    const termCodesItems = useMemo(() => {
        return termCodes.map(data => <DropdownTypeaheadItem key={data.code} value={data?.code} label={data.code} />);
    }, [termCodes]);

    const sectionItems = useMemo(() => {
        return sections?.map(data => <DropdownTypeaheadItem key={data.code} value={data?.id} label={data.code} />);
    }, [sections]);

    const studentItems = useMemo(() => {
        return students.map(data => <DropdownTypeaheadItem key={data.id} value={data?.id} label={data.name} />);
    }, [students]);

    const setGrade = (gradeId) => {
        const [grade] = grades.filter(grade => grade.id === gradeId);
        setData({ gradeId, newGrade: grade.code });
    }

    const gradeItems = useMemo(() => {
        let availableGrades = grades;
        if (data.oldGrade) {
            availableGrades = availableGrades.filter(item => {
                return item.code !== data.oldGrade;
            });
        }
        return availableGrades.map(data => <DropdownTypeaheadItem key={data.id} value={data?.id} label={data.code} />);
    }, [data.oldGrade, grades]);

    const changeReasonIds = useMemo(() => {
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
                                    {isFetchingSection && <CircularProgress size={20} className={classes.isLoading} />}
                                    <DropdownTypeahead
                                        helperText={errors?.sectionId}
                                        error={Boolean(errors?.sectionId?.length)}
                                        id="sectionId"
                                        label={isFetchingSection ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.sectionId' })}
                                        required={!isFetchingSection}
                                        onChange={(sectionId) => setData({ sectionId })}
                                        value={data?.sectionId}
                                        disabled={!data.term || isFetchingSection}
                                        fullWidth
                                    >
                                        {sectionItems}
                                    </DropdownTypeahead>
                                </Grid>
                                <Grid item xs={12} className={classes.relative}>
                                    {isFetchingStudent && <CircularProgress size={20} className={classes.isLoading} />}
                                    <DropdownTypeahead
                                        helperText={errors?.studentId}
                                        error={Boolean(errors?.studentId?.length)}
                                        id="studentId"
                                        value={data?.studentId}
                                        onChange={(studentId) => setStudentInformation(studentId)}
                                        disabled={!data.term ||!data.sectionId || isFetchingStudent}
                                        fullWidth
                                        label={isFetchingStudent ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.studentId' })}
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
                                    {isFetchingStudentTranscriptGrade && <CircularProgress size={20} className={classes.isLoading} />}
                                    <TextField
                                        helperText={errors?.oldGrade}
                                        error={Boolean(errors?.oldGrade?.length)}
                                        id={`oldGrade`}
                                        label={isFetchingStudentTranscriptGrade ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.oldGrade' })}
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
                                        onChange={(gradeId) => setGrade(gradeId)}
                                        disabled={!data.sectionId}
                                        fullWidth
                                        required
                                    >
                                        {gradeItems}
                                    </DropdownTypeahead>
                                </Grid>
                                <Grid item xs={12} lg={4} className={classes.relative}>
                                    {isFetchingCodes && <CircularProgress size={20} className={classes.isLoading} />}
                                    <DropdownTypeahead
                                        helperText={errors?.changeReasonId}
                                        error={Boolean(errors?.changeReasonId?.length)}
                                        id="changeReasonId"
                                        label={isFetchingCodes ? intl.formatMessage({ id: 'fields.loading' }) : intl.formatMessage({ id: 'fields.reasonForGradeChange' })}
                                        value={data?.changeReasonId}
                                        onChange={(changeReasonId) => setData({ changeReasonId })}
                                        disabled={isFetchingCodes}
                                        fullWidth
                                        required={!isFetchingCodes}
                                    >
                                        {changeReasonIds}
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
                            disabled={isLoading || !data.studentId || !data.oldGrade || !data.newGrade || !data.sectionId || !data.term || !data.changeReasonId}
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
        cacheEnabled: false,
        queryParameters: { acceptVersion: '1' },
        queryFunction: userTokenDataConnectQuery
    }


    const config = [
      {
        ...options,
        queryFunction: fetchAcademicPeriods,
        resource: academicPeriodResource
      },
      {
        ...options,
        queryFunction: fetchSections,
        resource: sectionResource
      },
      {
        ...options,
        queryFunction: fetchSectionRegistrations,
        resource: sectionRegistrationResource
      },
      {
        ...options,
        queryFunction: fetchGradeDefinitions,
        resource: gradeDefinitionResource
      },
      {
        ...options,
        queryFunction: fetchAcademicPeriods,
        resource: academicPeriodResource
      },
      {
        ...options,
          queryFunction: fetchGradeChangeReasons,
        resource: gradeChangeReasonsResource
      },
      {
        ...options,
        queryFunction: fetchPersons,
        resource: personsResource
      },
      {
        ...options,
        cacheEnabled: false,
        queryFunction: fetchStudentTranscriptGrades,
        resource: studentTranscriptGradesResource
      }
    ];

    return <MultiDataQueryProvider options={config}>
        <FacultyGradeChange />
    </MultiDataQueryProvider>
}

export default FacultyGradeChangeWithProviders;
