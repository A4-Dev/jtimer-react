import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { blue, green, grey, orange, red } from '@mui/material/colors';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'framer-motion';
import { info } from 'autoprefixer';

const sounds = {
  start: new Howl({ src: ['/sounds/start.mp3'] }),
  halfway: new Howl({ src: ['/sounds/halfway.mp3'] }),
  thirty: new Howl({ src: ['/sounds/30sec.mp3'] }),
  twenty: new Howl({ src: ['/sounds/20sec.mp3'] }),
  countdown: new Howl({ src: ['/sounds/countdown.mp3'] }),
  threetwoone: new Howl({ src: ['/sounds/threetwoone.mp3'] }),
  beeprest: new Howl({ src: ['/sounds/beeprest.mp3'] }),
  beepwork: new Howl({ src: ['/sounds/beepwork.mp3'] }),
  complete: new Howl({ src: ['/sounds/ahooga-horn.mp3'] }),
  getready: new Howl({ src: ['/sounds/getready.mp3'] }),
  halfwayfourtogo: new Howl({ src: ['/sounds/halfwayfourtogo.mp3'] }),
  halfwaytwotogo: new Howl({ src: ['/sounds/halfwaytwotogo.mp3'] }),
  last10: new Howl({ src: ['/sounds/last10.mp3'] }),
  restfinalround: new Howl({ src: ['/sounds/restfinalround.mp3'] }),
  rest: new Howl({ src: ['/sounds/rest.mp3'] }),
  round1: new Howl({ src: ['/sounds/round1.mp3'] }),
  round10: new Howl({ src: ['/sounds/round10.mp3'] }),
  round11: new Howl({ src: ['/sounds/round11.mp3'] }),
  round12: new Howl({ src: ['/sounds/round12.mp3'] }),
  round2: new Howl({ src: ['/sounds/round2.mp3'] }),
  round3: new Howl({ src: ['/sounds/round3.mp3'] }),
  round4: new Howl({ src: ['/sounds/round4.mp3'] }),
  round5: new Howl({ src: ['/sounds/round5.mp3'] }),
  round6: new Howl({ src: ['/sounds/round6.mp3'] }),
  round7: new Howl({ src: ['/sounds/round7.mp3'] }),
  round8: new Howl({ src: ['/sounds/round8.mp3'] }),
  round9: new Howl({ src: ['/sounds/round9.mp3'] }),
  statuschange: new Howl({ src: ['/sounds/statuschange.mp3'] }),
  continuing: new Howl({ src: ['/sounds/timercontinuing.mp3'] }),
  timerpaused: new Howl({ src: ['/sounds/timerpaused.mp3'] }),
  timerreset: new Howl({ src: ['/sounds/timerreset.mp3'] }),
};

const defaultTimers = [
  { name: 'Tabata', work: 20, rest: 10, rounds: 8 },
  { name: 'Half Tabata', work: 20, rest: 10, rounds: 4 },
  { name: '3 x 60', work: 60, rest: 5, rounds: 3 },
  { name: '3 x 90', work: 90, rest: 5, rounds: 3 },
  { name: '3 x 180', work: 90, rest: 5, rounds: 3 },
  { name: '6 x 60', work: 60, rest: 10, rounds: 6 },
  { name: '1 minute', work: 60, rest: 0, rounds: 1 },
  { name: '2 minutes', work: 120, rest: 0, rounds: 1 },
];

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Choose readable text color (black/white) based on background color
function getContrastColor(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const srgb = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return L > 0.4 ? '#111111' : '#ffffff';
}

export default function TabataTimerApp() {
  const [timers, setTimers] = useState(defaultTimers);
  const [activeTimer, setActiveTimer] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGettingReady, setIsGettingReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [enableCustom, setEnableCustom] = useState(false);

  const isComplete =
    hasStarted &&
    !isRunning &&
    !isGettingReady &&
    !isPaused &&
    activeTimer &&
    currentRound === activeTimer.rounds &&
    !isWork;

  const [backToTimerSelect, setBackToTimerSelect] = useState(false);



  // const progressPercent = activeTimer
  //   ? ((isWork ? timeLeft : activeTimer.rest - timeLeft) /
  //     (isWork ? activeTimer.work : activeTimer.rest)) * 100
  //   : 0;


  const getPhaseTotal = () => {
    if (!activeTimer) return 0;
    if (isGettingReady) return 10;                  // your get-ready is 10s
    return isWork ? activeTimer.work : activeTimer.rest;
  };

  const getPhaseElapsed = () => {
    if (!activeTimer) return 0;
    if (isGettingReady) return 10 - timeLeft;
    return isWork ? (activeTimer.work - timeLeft) : (activeTimer.rest - timeLeft);
  };

  const total = getPhaseTotal();
  const elapsed = getPhaseElapsed();

  const progressPercent = total > 0
    ? Math.min(100, Math.max(0, ((total - elapsed) / total) * 100)) // fill up as time elapses
    : 100;                                                // zero-length phase -> full


  // Dynamic page background
  const getBgColorValue = () => {
    if (!hasStarted) return '#ffffff';
    if (isGettingReady) return grey[700];
    if (isPaused) return orange[400];
    if (!isRunning && isComplete) return blue[700];
    if (isWork) return green[800];
    if (!activeTimer) return '#ffffff';
    if (backToTimerSelect) return '#ffffff';
    return red[800];
  };

  const pageBg = getBgColorValue();
  const pageFg = useMemo(() => getContrastColor(pageBg), [pageBg]);

  // Shared tile styling so Cards match the page background
  const tileSx = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    bgcolor: pageBg,
    color: pageFg,
    boxShadow: 'none',
    borderRadius: 3,
    border: '2px solid',
    borderColor: alpha(pageFg, 0.25),
    minHeight: 0, // allow inner flex to stretch
  };

  // Main timer / phase logic
  useEffect(() => {
    if (!activeTimer || !isRunning || isPaused) return;

    if (timeLeft === 0) {
      if (isGettingReady) {
        setIsGettingReady(false);
        setIsWork(true);
        setTimeLeft(activeTimer.work);
        sounds.start.play();
        return;
      }

      if (isWork) {
        if (currentRound === activeTimer.rounds) {
          setIsWork(false);
          setIsRunning(false);
          sounds.complete?.play();
        } else {
          setIsWork(false);
          setTimeLeft(activeTimer.rest);
        }
      } else {
        if (currentRound < activeTimer.rounds) {
          setIsWork(true);
          setCurrentRound((r) => r + 1);
          setTimeLeft(activeTimer.work);
        } else {
          setIsRunning(false);
        }
      }
      return;
    }

    // Mid-interval cues
    if (
      isWork &&
      activeTimer.work >= 20 &&
      activeTimer.work % 2 === 0 &&
      timeLeft === activeTimer.work / 2 &&
      timeLeft !== 30
    ) {
      sounds.halfway.play();
    }

    if (timeLeft === 30) {
      sounds.thirty.play();
    }

    if (timeLeft === 20 && activeTimer.name !== 'Tabata' && activeTimer.name !== 'Half Tabata') {
      sounds.twenty.play();
    }

    if (activeTimer.work >= 21 && timeLeft === 10 && isWork && !isGettingReady) {
      sounds.last10.play();
    }

    if (timeLeft === 3) sounds.threetwoone.play();

    if (timeLeft === activeTimer.work && isWork) sounds.beepwork.play();

    if (timeLeft === activeTimer.rest && !isWork && !isGettingReady) {
      sounds.beeprest.play();
      sounds.rest.play();
    }

    if (isWork && timeLeft === activeTimer.work) {
      const roundSound = sounds[`round${currentRound}`];
      roundSound?.play();
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [
    timeLeft,
    isRunning,
    isPaused,
    activeTimer,
    isGettingReady,
    isWork,
    currentRound,
  ]);

  const startTimer = () => {
    setHasStarted(true);
    if (!activeTimer) return;
    setIsGettingReady(true);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentRound(1);
    setIsWork(false);
    setTimeLeft(10);
    sounds.getready.play();
  };

  const pauseResumeTimer = () => {
    setIsPaused((prev) => {
      const newState = !prev;
      newState ? sounds.timerpaused.play() : sounds.continuing.play();
      return newState;
    });
  };

  const resetTimer = () => {
    setHasStarted(false);
    if (!activeTimer) return;
    setIsRunning(false);
    setIsPaused(false);
    setCurrentRound(1);
    setIsWork(true);
    setIsGettingReady(false);
    setTimeLeft(activeTimer.work);
    sounds.timerreset.play();
  };

  const addTimer = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const work = parseInt(form.work.value);
    const rest = parseInt(form.rest.value);
    const rounds = parseInt(form.rounds.value);
    const newTimer = { name, work, rest, rounds };

    setTimers((t) => [...t, newTimer]);
    setActiveTimer(newTimer);
    setTimeLeft(work);
    setCurrentRound(1);
    setIsWork(true);
    setIsRunning(false);
    setIsPaused(false);
    setEnableCustom(false);

    form.reset();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: pageBg,
        color: pageFg,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          py: 4,
          width: '100%',
          flexGrow: 1,
          display: 'flex',         // allow column layout
          flexDirection: 'column',
          minHeight: 0,            // let children stretch
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' },
              flexGrow: 1,
              textAlign: 'center',
              color: pageFg,
              whiteSpace: 'pre-line',
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {activeTimer ? `${activeTimer.name} (Work:${activeTimer.work} Rest:${activeTimer.rest})` : 'Combat Cardio Timers'}
          </Typography>
        </Box>

        {!activeTimer ? (
          <>
            {/* Presets */}
            <Box sx={{ my: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, fontWeight: 800 }}>
                Select a Timer:
              </Typography>
              <Tabs
                value={false}
                onChange={(_, newValue) => {
                  const timer = timers.find((t) => t.name === newValue);
                  if (timer) {
                    setActiveTimer(timer);
                    setTimeLeft(timer.work);
                    setCurrentRound(1);
                    setIsWork(false);
                    setIsRunning(false);
                    setIsPaused(false);
                    setEnableCustom(false);
                  }
                }}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                textColor="inherit"
              >
                {timers.map((timer) => (
                  <Tab
                    key={timer.name}
                    label={timer.name}
                    value={timer.name}
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.5rem' },
                      color: 'blue',
                      fontWeight: 900,
                      border: '2px solid',
                      borderColor: alpha(pageFg, 0.5),
                      borderRadius: 2,
                      my: 3,
                      mx: 1,
                      '&:hover': { color: 'red' } /*, borderColor: 'red', backgroundColor: alpha('red', 0.1) },*/
                      //'&.Mui-selected': { color: 'red', borderColor: 'red', backgroundColor: alpha('red', 0.2) },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Custom Timer */}
            {enableCustom && (
              <Box component="form" onSubmit={addTimer}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, mx: 2, my: 2 }}>
                  Add a Custom Timer
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField name="name" label="Timer Name" fullWidth required disabled={isRunning || !enableCustom} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField name="work" label="Work (sec)" type="number" fullWidth required disabled={isRunning || !enableCustom} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField name="rest" label="Rest (sec)" type="number" fullWidth required disabled={isRunning || !enableCustom} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField name="rounds" label="Rounds" type="number" fullWidth required disabled={isRunning || !enableCustom} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      type="submit"
                      color="info"
                      disabled={isRunning || !enableCustom}
                      sx={{
                        borderColor: alpha(pageFg, 0.5),
                        color: pageFg,
                        fontWeight: 800,
                        '&:hover': { borderColor: pageFg, backgroundColor: alpha(pageFg, 0.08) },
                        mx: 1,
                      }}
                    >
                      Add Timer & Run
                    </Button>
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={() => setEnableCustom(false)}
                      disabled={isRunning || !enableCustom}
                      sx={{
                        borderColor: alpha(pageFg, 0.5),
                        color: "red",
                        fontWeight: 800,
                        '&:hover': { borderColor: pageFg, backgroundColor: alpha(pageFg, 0.08) },
                        mx: 1,
                      }}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        ) : (
          <>
            {/* Progress Bar */}
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: alpha(pageFg, 0.2),
                  '& .MuiLinearProgress-bar': { backgroundColor: pageFg },
                }}
              />
            </Box>

            {/* Timer Display */}
            <Box
              sx={{
                mt: 3,
                width: '100%',
                display: 'flex',
                flex: 1,          // fill remaining vertical space
                minHeight: 0,     // allow Grid to stretch
              }}
            >
              <Grid
                container
                spacing={3}
                justifyContent="space-between"
                alignItems="stretch"
                sx={{
                  width: '100%',
                  margin: 0,
                  flex: 1,        // fill Timer Display box
                  minHeight: 0,
                }}
              >
                {/* Round Card */}
                <Grid item xs={12} sm={6} md={6} lg={6} sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
                  <Card sx={{ ...tileSx, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <CardContent
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        gap: 1,
                      }}
                    >
                      <Typography variant="h5" align="center" sx={{ fontWeight: 800, letterSpacing: 1 }}>
                        Round
                      </Typography>

                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                        <Typography
                          variant="h1"
                          sx={{
                            textAlign: 'center',
                            fontWeight: 900,
                            lineHeight: 1,
                            fontSize: { xs: '12vh', sm: '16vh', md: '24vh', lg: '32vh' },
                          }}
                        >
                          {currentRound} / {activeTimer.rounds}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Count Card */}
                <Grid item xs={12} sm={6} md={6} lg={6} sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
                  <Card sx={{ ...tileSx, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <CardContent
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        gap: 1,
                      }}
                    >
                      <Typography variant="h5" align="center" sx={{ fontWeight: 800, letterSpacing: 1 }}>
                        Count
                      </Typography>

                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                        {timeLeft <= 3 ? (
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={timeLeft}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
                              initial={{ opacity: 0.8, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0.8, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Typography
                                variant="h1"
                                sx={{
                                  textAlign: 'center',
                                  fontWeight: 900,
                                  lineHeight: 1,
                                  fontSize: { xs: '12vh', sm: '16vh', md: '24vh', lg: '32vh' },
                                }}
                              >
                                {formatTime(timeLeft)}
                              </Typography>
                            </motion.div>
                          </AnimatePresence>
                        ) : (
                          <Typography
                            variant="h1"
                            sx={{
                              textAlign: 'center',
                              fontWeight: 900,
                              lineHeight: 1,
                              fontSize: { xs: '12vh', sm: '16vh', md: '24vh', lg: '32vh' },
                            }}
                          >
                            {formatTime(timeLeft)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        )}

        {/* Footer Buttons */}
        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          {!isRunning && !isComplete && activeTimer && (
            <Button variant="contained" color="success" onClick={startTimer} sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, fontWeight: 800 }}>
              START
            </Button>
          )}
          {isRunning && activeTimer && (
            <Button variant="contained" color="primary" onClick={pauseResumeTimer} sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, fontWeight: 800 }}>
              {isPaused ? 'RESUME' : 'PAUSE'}
            </Button>
          )}
          {(isPaused || isComplete) && activeTimer && (
            <Button variant="contained" color="warning" onClick={resetTimer} sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, fontWeight: 800 }}>
              RESET
            </Button>
          )}
        </Box>

        <Box mt={4} display="flex" gap={2}>
          {!isRunning && !isComplete && !activeTimer && !enableCustom && (
            <Button
              variant="contained"
              color="info"
              onClick={() => setEnableCustom(true)}
              sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, fontWeight: 600 }}
            >
              Create Custom Timer
            </Button>
          )}
        </Box>

        {activeTimer && (isPaused || isComplete || !isRunning) && (
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                sounds.statuschange.play();
                setHasStarted(false);
                setIsRunning(false);
                setActiveTimer(false);
                setIsPaused(false);
              }}
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                borderColor: alpha(pageFg, 0.5),
                '&:hover': { borderColor: pageFg, backgroundColor: alpha(pageFg, 0.08), color: 'black' },
              }}
            >
              Back To Timer Select
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
