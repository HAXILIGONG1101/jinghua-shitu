/** 简化示意地图:区级 4×4 网格 + 当前街道 6 个社区区块。 */
import { MapPin } from "lucide-react";
import { DISTRICT, DISTRICTS_GRID, STREET } from "../content";

export function MiniMap() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1.5 flex items-center gap-1 text-[10.5px] text-ink-mute">
          <MapPin size={12} /> 区级示意(仅作位置参考)
        </div>
        <div className="grid grid-cols-4 gap-1">
          {DISTRICTS_GRID.map((d) => {
            const active = d.current;
            return (
              <div
                key={d.name}
                className={`flex h-8 items-center justify-center border text-[9.5px] leading-none ${
                  active
                    ? "border-seal bg-seal-pale font-semibold text-seal"
                    : "border-paper-edge bg-paper text-ink-mute"
                }`}
                title={d.name}
              >
                {d.name.replace(/[区县]$/, "")}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1 text-[10.5px] text-ink-mute">
          <MapPin size={12} /> {DISTRICT.name}{STREET.name} 辖区示意
        </div>
        <div className="grid grid-cols-3 gap-1">
          {STREET.communities.map((name, index) => (
            <div
              key={name}
              className={`flex h-9 flex-col items-center justify-center border text-[9.5px] leading-tight ${
                index === 0
                  ? "border-slate2 bg-slate2-pale text-slate2"
                  : "border-paper-edge bg-paper text-ink-mute"
              }`}
              title={name}
            >
              <span>{name.replace(/社区$/, "")}</span>
              <span className="text-[8.5px] opacity-70">社区</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] leading-4 text-ink-mute">
        本图只表示游戏内辖区的相对位置,不含真实地理数据、面积与人口信息。
      </p>
    </div>
  );
}
