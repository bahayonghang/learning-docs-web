import type { FigureId, Locale, Localized } from './types';
import { l } from './content/helpers';

export interface Figure {
  id: FigureId;
  title: Localized;
  description: Localized;
  category: 'foundations' | 'markets' | 'practice';
}

export const figures: Figure[] = [
  { id: 'foundations', title: l('用数学描述电力与不确定性', 'Mathematics for electricity and uncertainty'), description: l('电表与时钟、特征积木、概率托盘和坡面，分别对应单位、向量、随机性与梯度。', 'A meter and clock, feature blocks, probability tokens, and a slope introduce units, vectors, uncertainty, and gradients.'), category: 'foundations' },
  { id: 'neural-forecast', title: l('从数据学习的预测工坊', 'A forecasting workshop that learns'), description: l('把天气、生产与历史用电作为输入，通过参数学习得到预测，再用实际结果提供反馈。', 'Weather, production, and past energy use become inputs. Learned parameters produce forecasts; observations provide feedback.'), category: 'foundations' },
  { id: 'power-system', title: l('始终需要平衡的电力系统', 'An electricity system that must stay balanced'), description: l('发电、电网、工业用户与储能连接在同一物理系统中，交易安排需要服从运行约束。', 'Generation, the grid, industry, and storage share one physical system. Market schedules must respect operating limits.'), category: 'markets' },
  { id: 'market-clearing', title: l('从报价与需求，到市场出清', 'From offers and demand to market clearing'), description: l('报价、需求和网络可用能力共同影响调度结果；图片用于建立直觉，精确阶梯和价格由实验计算。', 'Offers, demand, and network capability shape dispatch. The illustration builds intuition; the experiment calculates exact steps and prices.'), category: 'markets' },
  { id: 'forecasting', title: l('从历史记录，看向多种未来', 'From observed history to possible futures'), description: l('历史数据、天气与生产信息支持预测；未来情景保留不确定性，而不是假装知道明天。', 'Records, weather, and production inform a forecast. Future scenarios retain uncertainty instead of pretending tomorrow is known.'), category: 'practice' },
  { id: 'settlement', title: l('让计划、实际与账款对应起来', 'Connecting plans, measurements, and accounts'), description: l('日前计划与实际电量分开记录，再按教学双结算模型解释实时差额和电能量费用。', 'Record day-ahead plans and actual energy separately, then explain the real-time difference and energy cost using a teaching model.'), category: 'markets' },
  { id: 'flexibility', title: l('储能与工业负荷的调节空间', 'Flexibility in storage and industrial demand'), description: l('在不破坏生产约束的前提下调整时段；储能受库存、功率、效率与可用容量限制。', 'Shift timing while respecting production constraints. Storage is bounded by inventory, power, efficiency, and available capacity.'), category: 'practice' },
  { id: 'decision-loop', title: l('串起数据、预测、决策与复盘', 'Connect data, forecasts, decisions, and review'), description: l('电力交易业务从可用信息出发，经预测与约束优化形成申报，最后用计量和结算复盘。', 'Trading starts with available information, uses forecasting and constrained optimization to form submissions, then reviews metering and settlement.'), category: 'practice' },
];

export const figurePath = (id: FigureId, locale: Locale): string => `${import.meta.env.BASE_URL}images/${id}-${locale}.webp`;
