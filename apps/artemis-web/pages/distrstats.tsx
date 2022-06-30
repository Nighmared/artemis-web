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
import Image from 'next/image';




function get_stats(token) {
    const requestOptions = {
        "headers": {
            "secret": token,
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

const DistrStatsPage = (props: any) => {

    const [ready, setReady] = useState(false);
    const [overlays, setOverlays] = useState([]);
    const [lastUpdated, setLastUpdated] = useState("Never");
    const [isLive, setIsLive] = useState(true);
    const [intervalId, setIntervalId] = useState(-1);
    const [hijackTimespanIndex, setHijackTimespanIndex] = useState(0);
    const [jwtToken, setjwtToken] = useState("");
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
            tmp_overlays.push({ name: statskey.charAt(0).toUpperCase() + statskey.slice(1), hijacked_count: Object.keys(resultjson[statskey].hijacked_ips).length, total_nodes: resultjson[statskey].total_nodes });
        }
        setOverlays(tmp_overlays);
        setReady(true);
    }


    function get_overlay_graph(overlay_name):string {
        return `https://${window.location.hostname}:${window.location.port}/get_graph?secret=${jwtToken}&overlay=${overlay_name}`
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
                                                {overlay.hijacked_count} out of {overlay.total_nodes} nodes that were online during the configured<br />
                                                timespan were affected by a hijack during the monitored time.                                        
                                            </p>
                                            
                                        </div>  
                                        <img style={{width: "100%"}} src={get_overlay_graph(overlay.name)}></img>
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

    function store_token(t:string):string {
        setjwtToken(t);
        return t;
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
            .then(t => store_token(t))
            .then(t => get_stats(t))
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
                                {/* <div className="row">
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
                                </div> */}
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