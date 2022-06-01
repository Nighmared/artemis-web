import React, { useEffect, useState } from 'react';
import Media from 'react-media'
import AuthHOC from '../components/401-hoc/401-hoc';
import { setup } from '../libs/csrf'
import Head from 'next/head'
import {
    autoLogout,
    GLOBAL_MEDIA_QUERIES
} from "../utils/token"
import { ToastContainer } from 'react-toastify';
import { FormGroup, FormControlLabel } from '@material-ui/core';
import { AntSwitch } from '../utils/styles';




function get_stats(token, timespan) {
    const requestOptions = {
        "headers": {
            "secret": token,
            "timespan": timespan
        }
    }
    const req = fetch(`https://${window.location.hostname}:${window.location.port}/get_stats`, requestOptions)
    return req
}

function FormatTimeStamp(props: any) {
    if (props.ready) {
        const TStampDate = new Date(props.timestamp * 1000);
        const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
        const stringOptions = TStampDate.toLocaleString(undefined, options);
        return <p>Last updated: {stringOptions}</p>;
    }
    return <p> Last updated: Never</p>;
}

const LIVERELOADDELAY = 600_000; //10 minutes between live reloads
const TIMESPAN_VARS = [
    { repr: "10min", description: "10 minutes", minutes: 10 },
    { repr: "1h", description: "hour", minutes: 60 },
    { repr: "2h", description: "2 hours", minutes: 120 },
    { repr: "2d", description: "2 days", minutes: 2880 },
    { repr: "1 Week", description: "week", minutes: 10080 },
    { repr: "1 Month", description: "month", minutes: 44640 },
];

const DistrStatsPage = (props: any) => {

    const [ready, setReady] = useState(false);
    const [overlays, setOverlays] = useState([]);
    const [lastUpdated, setLastUpdated] = useState("Never");
    const [isLive, setIsLive] = useState(true);
    const [intervalId, setIntervalId] = useState(-1);
    const [hijackTimespanIndex, setHijackTimespanIndex] = useState(0);
    if (isLive && intervalId === -1) {
        setIntervalId(Number(setInterval(LoadStats, LIVERELOADDELAY)));
    }

    function handle_stats(resultjson) {
        setLastUpdated(resultjson.timestamp);

        const tmp_overlays = [];
        for (const statskey in resultjson) {
            if (statskey === "timestamp") {
                continue;
            }
            tmp_overlays.push({ name: statskey.charAt(0).toUpperCase() + statskey.slice(1), hijacked_count: resultjson[statskey].hijacked_ips.length, total_nodes: resultjson[statskey].total_nodes });
        }
        setOverlays(tmp_overlays);
        setReady(true);
    }

    const OverlayStats = () => {
        if (ready) {
            return <>
                {
                    overlays.map((overlay: any) => (
                        <div className="col-lg-5">
                            <div className="card">
                                <div className="card-header" style={{ backgroundColor: "white" }}>
                                    <div className="row">
                                        <h2> {overlay.name}</h2>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {/* <div className="col-sm-1" /> */}
                                        <div className="col-lg-10">
                                            <p>
                                                {overlay.hijacked_count} out of {overlay.total_nodes} currently
                                                online {overlay.name} Nodes have been affected by potential hijacks in
                                                the last {TIMESPAN_VARS[hijackTimespanIndex].description}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
                </>
        }

        return <p>Loading...</p>;
    }


    function toggleLive() {
        if (isLive) {
            clearInterval(intervalId);
            setIntervalId(-1);
            setIsLive(false);

        } else if (intervalId === -1) {
            setIntervalId(Number(setInterval(LoadStats, LIVERELOADDELAY)));
            setIsLive(true);
            LoadStats();
        } else {
            console.log(isLive + " " + intervalId + " wtf");
        }
    }

    function LoadStats() {
        fetch(`https://${window.location.hostname}:${window.location.port}/api/auth/jwt`)
            .then(res => res.json())
            .then(r => r.accessToken)
            .then(t => get_stats(t, TIMESPAN_VARS[hijackTimespanIndex].minutes))
            .then(res => res.json())
            .then(r => handle_stats(r));
    }

    useEffect(LoadStats, [hijackTimespanIndex]);
    useEffect(() => {
        autoLogout(props);
    }, [props]);

    const user = props.user;


    return (
        <>
            <Head>
                <title>ARTEMIS - Distributed System Stats</title>
            </Head>
            {user &&
                (
                    <Media queries={GLOBAL_MEDIA_QUERIES}>
                        {(matches) => (
                            <div className="container overview col-lg-12">
                                <div className="row">
                                    <div className="col-lg-1" />
                                    <div className="col-lg-10">
                                        <div className="row">
                                            <div className="col-lg-9">
                                                <h1 style={{ color: 'black' }}>Distributed Hijack Stats</h1>
                                            </div>
                                            {matches.pc && (
                                                <div className="col-lg-2">
                                                    <h2 style={{ color: 'black' }}> Live Update: </h2>{' '}
                                                </div>
                                            )}
                                            <div className="col-lg-1">
                                                <FormGroup>
                                                    <FormControlLabel
                                                        control={
                                                            <AntSwitch
                                                                onChange={() => {
                                                                    toggleLive();
                                                                }}
                                                                size="medium"
                                                                checked={isLive}
                                                            />
                                                        }
                                                        label=""
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                        <hr />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-1" />
                                    <div className="col-lg-5">
                                        <label htmlFor="timespan">Timespan of Hijacks to consider</label>
                                        <select id="timespan" onChange={(event) => setHijackTimespanIndex(Number(event.target.value))}  >
                                            {
                                                TIMESPAN_VARS.map(
                                                    (timespan, index) => (
                                                        <option
                                                            value={index}>
                                                            {timespan.repr}
                                                        </option>
                                                    )
                                                )
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-1" />

                                    <OverlayStats />

                                    
                                </div>
                                <br />
                                <div className="row">
                                    <div className="col-lg-1" />
                                    <div className="col-lg-10">
                                        <FormatTimeStamp timestamp={lastUpdated} ready={ready} />
                                    </div>
                                </div>

                                <ToastContainer />
                            </div>

                        )
                        }
                    </Media>
                )
            }


        </>);
}

export default AuthHOC(DistrStatsPage, ["admin", "user"]);

export const getServerSideProps = setup(async (req, res, csrftoken) => {
    return {
        props: {
            _csrf: csrftoken,
            isTesting: process.env.TESTING === 'true',
            _inactivity_timeout: process.env.INACTIVITY_TIMEOUT,
            system_version: process.env.SYSTEM_VERSION,
        },
    };
});