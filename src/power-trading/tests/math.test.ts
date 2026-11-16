import test from 'node:test';
import assert from 'node:assert/strict';
import { energyCost, scenarioStats, neuron, gradientStep, mse, trainX, trainY, clearMarket, twoZoneDispatch, forecastDay, rollingBacktest, empiricalQuantile, pinballLoss, settle, upperCvar, hedgeCosts, batteryStep, storageCycle, type BatteryConfig } from '../src/labs/math';
const close = (a: number, b: number, eps=1e-8) => assert.ok(Math.abs(a-b)<eps, `${a} ≠ ${b}`);

test('energy uses MW × h = MWh, permits zero and negative prices',()=>{
  assert.deepEqual(energyCost(8,2,400),{energy:16,cost:6400});
  close(energyCost(1,.25,500).cost,125); close(energyCost(4,0,400).energy,0);
  close(energyCost(1,1,-50).cost,-50); assert.throws(()=>energyCost(-1,2,400));
});
test('scenario normalization and zero-weight rejection',()=>{
  const r=scenarioStats([200,400,1000],[25,60,15]);close(r.mean,440);close(r.probabilities.reduce((a,b)=>a+b,0),1);
  close(r.variance,62400);assert.throws(()=>scenarioStats([1,2],[0,0]));assert.throws(()=>scenarioStats([1,2],[1,-1]));
});
test('neuron scaling, signed weights, and inactive ReLU',()=>{
  const r=neuron(30,60,.6,.8,.2);close(r.x[0],1);close(r.x[1],.5);close(r.z,1.2);close(r.prediction,74);
  close(neuron(20,50,.6,.8,-1).prediction,50);close(neuron(30,60,-.6,-.8,0).activation,0);
});
test('analytic gradient agrees with finite differences and converges',()=>{
  const w=-.3,b=.1,eps=1e-5,r=gradientStep(w,b,.1);
  close(r.dw,(mse(trainX,trainY,w+eps,b)-mse(trainX,trainY,w-eps,b))/(2*eps),1e-6);
  close(r.db,(mse(trainX,trainY,w,b+eps)-mse(trainX,trainY,w,b-eps))/(2*eps),1e-6);
  let state={w,b};const initial=mse(trainX,trainY,w,b);for(let i=0;i<80;i++)state=gradientStep(state.w,state.b,.1);
  assert.ok(mse(trainX,trainY,state.w,state.b)<initial/100);
});
test('merit-order handles partial acceptance, zero demand, negative prices, and shortages',()=>{
  const offers=[{id:'A',capacity:40,price:-50},{id:'B',capacity:60,price:300}];
  const r=clearMarket(offers,70);close(r.rows[0].accepted,40);close(r.rows[1].accepted,30);assert.equal(r.price,300);
  assert.equal(clearMarket(offers,0).price,null);assert.equal(clearMarket(offers,30).price,-50);
  const short=clearMarket(offers,120);assert.equal(short.price,null);close(short.shortage,20);
  assert.equal(clearMarket(offers,40).price,-50);assert.throws(()=>clearMarket(offers,-5));
});
test('tied offers share a partial group proportionally and independently of input order',()=>{
  const a={id:'A',capacity:30,price:100},b={id:'B',capacity:90,price:100};
  const r=clearMarket([a,b],60),reordered=clearMarket([b,a],60);
  close(r.rows[0].accepted,15);close(r.rows[1].accepted,45);assert.deepEqual(r,reordered);
});
test('two-zone transport respects power balances and distinguishes constrained marginal costs',()=>{
  const r=twoZoneDispatch(60,100);close(r.genA-r.flow,40);close(r.genB+r.flow,100);close(r.flow,60);assert.equal(r.marginalB,600);
  const open=twoZoneDispatch(120,100);assert.equal(open.marginalB,200);close(open.genB,0);assert.ok(open.totalCost<r.totalCost);
  assert.equal(twoZoneDispatch(100,100).kink,true);
  assert.equal(twoZoneDispatch(160,160).marginalA,600);
  assert.equal(twoZoneDispatch(160,160).marginalB,600);
});
test('forecast is deterministic and computes both MAEs from the same 24 targets',()=>{
  const a=forecastDay(28,1,0),b=forecastDay(28,1,0);assert.deepEqual(a,b);assert.equal(a.actual.length,24);
  close(a.modelMae,a.actual.reduce((s,y,i)=>s+Math.abs(y-a.predicted[i]),0)/24);
  assert.ok(forecastDay(34,1.4,0).modelMae<forecastDay(34,0,0).modelMae);
});
test('rolling backtest cannot see a future level shift before it is observed',()=>{
  const noShift=rollingBacktest(0),shift=rollingBacktest(20),leak=rollingBacktest(20,true);
  assert.deepEqual(noShift.predictions.slice(0,7),shift.predictions.slice(0,7));
  assert.notEqual(noShift.predictions[7],shift.predictions[7]);
  assert.notEqual(leak.predictions[0],shift.predictions[0]);assert.equal(shift.predictions.length,24);
});
test('empirical quantiles minimize pinball loss including nonunique finite-sample medians',()=>{
  const sample=[1,2,3,4];close(empiricalQuantile(sample,.5),2);close(empiricalQuantile(sample,0),1);close(empiricalQuantile(sample,1),4);
  close(pinballLoss(sample,2,.5),pinballLoss(sample,2.5,.5));
  for(const q of [.1,.5,.9]){const v=empiricalQuantile(sample,q);for(const x of [-1,0,1,2,3,4,5])assert.ok(pinballLoss(sample,v,q)<=pinballLoss(sample,x,q)+1e-10);}
});
test('two-settlement arithmetic avoids charging actual energy twice and handles credits',()=>{
  const r=settle(100,110,400,700);close(r.dayAmount,40000);close(r.realAmount,7000);close(r.total,47000);
  close(settle(120,90,400,700).realAmount,-21000);close(settle(100,110,400,-50).realAmount,-500);
  close(settle(100,110,400,400).total,110*400);
});
test('CVaR takes fractional probability at the tail boundary',()=>{
  close(upperCvar([100,200,1000],[.5,.4,.1],.8),600);
  close(upperCvar([100,200,1000],[.5,.4,.1],0),230);
  close(upperCvar([100,200,1000],[.5,.4,.1],.95),1000);assert.throws(()=>upperCvar([1],[1],1));
});
test('full hedge removes only price-scenario variation, while no hedge follows spot',()=>{
  const full=hedgeCosts(100,1,380);assert.deepEqual(full.costs,[38000,38000,38000]);close(full.sd,0);close(full.cvar,38000);
  assert.deepEqual(hedgeCosts(100,0,380).costs,[22000,42000,95000]);
});
const battery:BatteryConfig={capacity:4,maxPower:2,hours:1,chargeEfficiency:.9,dischargeEfficiency:.9};
test('battery charging and discharging use grid-side power with opposite efficiency directions',()=>{
  const charge=batteryStep(0,2,200,battery);close(charge.energy,1.8);close(charge.loss,.2);close(charge.cashflow,-400);
  const discharge=batteryStep(charge.energy,-2,600,battery);close(discharge.power,-1.62);close(discharge.energy,0);close(discharge.cashflow,972);assert.ok(discharge.clipped);
});
test('battery never exceeds energy or power constraints and handles zero duration',()=>{
  const full=batteryStep(3.9,2,200,battery);close(full.energy,4);close(full.power,1/9);assert.ok(full.clipped);
  close(batteryStep(0,-2,600,battery).power,0);close(batteryStep(0,10,200,battery).power,2);
  close(batteryStep(1,2,200,{...battery,hours:0}).energy,1);assert.throws(()=>batteryStep(5,1,200,battery));
});
test('complete and incomplete storage cycles obey energy conservation',()=>{
  for(const discharge of [1,.2]){const r=storageCycle(battery,2,discharge);close(r.bought-r.sold-r.losses,r.terminalEnergy);r.steps.forEach(s=>assert.ok(s.energy>=0&&s.energy<=battery.capacity));}
  close(storageCycle(battery,2,1).terminalEnergy,0);assert.ok(storageCycle(battery,2,.2).terminalEnergy>0);
});
