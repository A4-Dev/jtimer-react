import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'framer-motion';

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

  const isComplete =
  hasStarted &&
  !isRunning &&
  !isGettingReady &&
  !isPaused &&
  currentRound === activeTimer.rounds &&
  !isWork;

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

      sounds.countdown.play();

      if (isWork) {
        // we just finished a work interval
        if (currentRound === activeTimer.rounds) {
          // Last round done → complete immediately
          setIsWork(false);
          setIsRunning(false);
          sounds.complete?.play();
        } else {
          // not yet last round → go into rest
          setIsWork(false);
          setTimeLeft(activeTimer.rest);
        }
      } else {
        // we just finished a rest interval
        if (currentRound < activeTimer.rounds) {
          setIsWork(true);
          setCurrentRound(r => r + 1);
          setTimeLeft(activeTimer.work);
        } else {
          // safety fallback
          setIsRunning(false);
        }
      }
      return;
    }

    if (
      isWork &&
      activeTimer.work >= 20 &&
      activeTimer.work % 2 === 0 &&
      timeLeft === activeTimer.work / 2
    ) {
      sounds.halfway.play();
    }
    if (!activeTimer.work === 60 && timeLeft === 30) sounds.thirty.play();
    if (timeLeft === 20 && activeTimer.name !== 'Tabata' && activeTimer.name !== 'Half Tabata') sounds.twenty.play();
    if (timeLeft === 10 && activeTimer.name !== 'Tabata' && activeTimer.name !== 'Half Tabata' && !isGettingReady) sounds.last10.play();
    if (timeLeft === 3) sounds.threetwoone.play();
    if (timeLeft === activeTimer.work && isWork) sounds.beepwork.play();
    if (timeLeft === activeTimer.rest && !isWork && !isGettingReady) {
      sounds.beeprest.play() && sounds.rest.play();
    }
    if (isWork && timeLeft === activeTimer.work) {
      const roundSound = sounds[`round${currentRound}`];
      if (roundSound) roundSound.play();
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRunning, isPaused, activeTimer]);

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

    setTimers([...timers, newTimer]);
    setActiveTimer(newTimer);
    setTimeLeft(work);
    setCurrentRound(1);
    setIsWork(true);
    setIsRunning(false);
    setIsPaused(false);

    form.reset();
  };

  const getBgColor = () => {
    if (!hasStarted) return 'bg-white';    
    if (isGettingReady) return 'bg-gray-600';
    if (isPaused) return 'bg-orange-400';
    if (!isRunning && isComplete) return 'bg-blue-700';
    if (isWork) return 'bg-green-800';
    if (!activeTimer) return 'bg-white';
    return 'bg-red-800';
  };

  useEffect(() => {
    const bgClass = getBgColor();
    document.body.classList.remove(
      'bg-gray-200',
      'bg-red-200',
      'bg-green-200',
      'bg-orange-200',
      'bg-blue-200',
      'bg-white',
    );
    document.body.classList.add(bgClass);
    return () => document.body.classList.remove(bgClass);
  }, [activeTimer, isGettingReady, isPaused, isWork, isRunning, isComplete, activeTimer]);

  return (
    <div className={`transition-all duration-500 ease-in-out min-h-screen p-6 space-y-6 ${getBgColor()}`}>
    <h1 className="text-3xl font-bold">
        {activeTimer
          ? activeTimer.name
          : 'Combat Cardio Timers'}
      </h1>

      {!activeTimer ? (
        <>
          <Tabs onValueChange={(val) => {
            const timer = timers.find(t => t.name === val);
            if (timer) {
              setActiveTimer(timer);
              setTimeLeft(timer.work);
              setCurrentRound(1);
              setIsWork(false);
              setIsRunning(false);
              setIsPaused(false);
            }
          }}>
            <TabsList>
              {timers.map(timer => (
                <TabsTrigger key={timer.name} value={timer.name}>
                  {timer.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-col lg:flex-row gap-4">
          <Card>
          <CardContent className="p-4 justify-between">
          <form onSubmit={addTimer} className="space-y-2">
            <h2 className="text-xl font-semibold">Add New Timer</h2>
            <Input name="name" placeholder="Timer Name" required />
            <Input name="work" type="number" placeholder="Work Duration (sec)" required />
            <Input name="rest" type="number" placeholder="Rest Duration (sec)" required />
            <Input name="rounds" type="number" placeholder="Rounds" required />
            <Button type="submit">Add Timer</Button>
          </form>
          </CardContent>
          </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full ">
              <p className="text-[96px] font-bold">Round:</p>
              <p className="text-[200px] font-bold">{currentRound} / {activeTimer.rounds}</p>
              <div className="mt-auto flex justify-center space-x-2">
                {(!isRunning || isPaused || isComplete) && <Button
                  variant="secondary"
                  onClick={() => {
                    {/*resetTimer();*/ }
                    sounds.beeprest.play();
                    setHasStarted(false);
                    setActiveTimer(null); // go back to timer selection
                  }}
                >
                  Back to Timer Selection
                </Button>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-[96px] font-bold">Count:</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={timeLeft}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="text-[200px] font-bold"
                >
                  {formatTime(timeLeft)}
                </motion.div>
              </AnimatePresence>
              <div className="mt-auto flex justify-center space-x-2">
                {!isRunning && !isComplete && <Button onClick={startTimer}>Start</Button>}
                {isRunning && <Button onClick={pauseResumeTimer}>{isPaused ? 'Resume' : 'Pause'}</Button>}
                {(isPaused || isComplete) && <Button onClick={resetTimer}>Reset</Button>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/*    <div className="text-[48px] font-bold">
        {isGettingReady ? 'Get Ready' : isWork ? 'Work' : 'Rest'}
          </div>  */}
    </div>
  );
}
