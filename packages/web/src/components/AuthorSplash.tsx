/** 开场署名页:每次打开或刷新都会显示一次。 */
import { ArrowRight, Landmark, ShieldCheck } from "lucide-react";
import { AUTHOR } from "../content";

export function AuthorSplash({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-wood-deep">
      <div className="flex min-h-full items-center justify-center px-3 py-6">
        <div className="max-w-[520px] min-w-0 border border-wood-line bg-paper shadow-2xl" style={{ width: "min(520px, calc(100vw - 24px))" }}>
          <div className="border-b-2 border-seal px-5 py-5 md:px-7 md:py-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-seal"><Landmark size={30} /></div>
              <div className="min-w-0">
                <h1 className="text-[26px] font-bold leading-none tracking-[0.14em] md:text-[32px]">京华·仕途</h1>
                <p className="mt-2 text-[11.5px] leading-5 text-ink-mute">
                  北京市城市治理模拟 · 基层到领导的职业成长 · 电脑与手机都能玩
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-5 md:px-7">
            <div className="flex items-center justify-between border border-paper-edge bg-white px-3.5 py-3">
              <div>
                <div className="text-[10.5px] text-ink-mute">作者</div>
                <div className="mt-0.5 text-[17px] font-bold tracking-[0.1em] text-seal">{AUTHOR}</div>
              </div>
              <div className="text-right text-[10.5px] leading-4 text-ink-mute">
                版本 V1.2 极简版<br />五页 · 六项属性
              </div>
            </div>

            <ul className="flex flex-col gap-1.5 text-[11.5px] leading-5 text-ink-soft">
              <li>
                <span className="font-semibold text-ink">玩法:</span>
                每月处理重要事件,点选方案拿结果;处理完点「推进一个月」。
              </li>
              <li>
                <span className="font-semibold text-ink">目标:</span>
                通过季度考核逐步晋升;政绩、群众满意度、组织信任、财政、社会稳定、廉政风险六项决定你的结局。
              </li>
              <li>
                <span className="font-semibold text-ink">操作:</span>
                除新建角色时填写名字外,全部是选项和按钮;存档自动保存在本机浏览器。
              </li>
            </ul>

            <div className="flex items-start gap-2 border border-paper-edge bg-white px-3 py-2.5 text-[10.5px] leading-4 text-ink-mute">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate2" />
              <span>
                数据说明:行政区划名称仅作示意参考,人物、项目、事件与全部数值均为模拟内容,
                不代表任何现实机构或个人,也不是官方统计。
              </span>
            </div>

            <button
              className="btn btn-primary mt-1 w-full py-2.5 text-[14px] font-semibold tracking-[0.08em]"
              onClick={onEnter}
            >
              进入游戏 <ArrowRight size={16} />
            </button>
            <p className="text-center text-[10.5px] text-ink-mute">作者 {AUTHOR} · 本页每次打开网页显示一次</p>
          </div>
        </div>
      </div>
    </div>
  );
}
