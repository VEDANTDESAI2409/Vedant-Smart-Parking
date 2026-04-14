import React, { useMemo, useState } from 'react';
import {
  Accessibility,
  Bike,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Zap,
} from 'lucide-react';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const getSlotSortKey = (slotNumber) => {
  const raw = String(slotNumber || '').trim().toUpperCase();
  const prefix = raw.match(/^[A-Z]+/)?.[0] || '';
  const num = Number(raw.match(/\d+/)?.[0] || 0);
  return { prefix, num, raw };
};

const sortSlots = (slots) =>
  (slots || [])
    .slice()
    .sort((a, b) => {
      const ak = getSlotSortKey(a?.slotNumber);
      const bk = getSlotSortKey(b?.slotNumber);
      if (ak.prefix !== bk.prefix) return collator.compare(ak.prefix, bk.prefix);
      if (ak.num !== bk.num) return ak.num - bk.num;
      return collator.compare(ak.raw, bk.raw);
    });

const splitSlotsIntoSides = (slots) => {
  const left = [];
  const right = [];
  const unknown = [];

  (slots || []).forEach((slot) => {
    const value = String(slot?.slotNumber || '').trim().toUpperCase();
    if (value.startsWith('A')) left.push(slot);
    else if (value.startsWith('B')) right.push(slot);
    else unknown.push(slot);
  });

  if (unknown.length) {
    const sortedUnknown = sortSlots(unknown);
    const midpoint = Math.ceil(sortedUnknown.length / 2);
    left.push(...sortedUnknown.slice(0, midpoint));
    right.push(...sortedUnknown.slice(midpoint));
  }

  return { left: sortSlots(left), right: sortSlots(right) };
};

const slotTypeBadge = (slotType) => {
  if (slotType === 'ev') {
    return { label: 'EV', Icon: Zap, className: 'border-blue-200 bg-blue-50 text-blue-700' };
  }
  if (slotType === 'disabled' || slotType === 'disable') {
    return { label: 'DIS', Icon: Accessibility, className: 'border-slate-200 bg-slate-100 text-slate-600' };
  }
  return null;
};

const getBlueprintSlotClasses = ({ isBookable, slotType, isSelected }) => {
  if (isSelected) {
    return 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-300/70';
  }

  if (!isBookable) {
    return 'border-red-400 bg-red-100 text-red-800';
  }

  if (slotType === 'ev') {
    return 'border-blue-400 bg-blue-100 text-blue-800';
  }

  if (slotType === 'disabled' || slotType === 'disable') {
    return 'border-slate-300 bg-slate-100 text-slate-700';
  }

  return 'border-green-400 bg-green-100 text-green-800';
};

const BlueprintSlotTile = ({ slot, isSelected, onSelect, vehicleType, rotated = false }) => {
  const isOpen = !!slot?.isBookable;
  const slotNumber = slot?.slotNumber || '--';
  const slotType = slot?.slotType;
  const VehicleIcon = vehicleType === 'bike' ? Bike : Car;

  return (
    <button
      type="button"
      disabled={!isOpen}
      onClick={() => onSelect?.(slot)}
      className={`relative flex h-20 w-12 select-none items-center justify-center rounded-md border text-[10px] font-bold tracking-[0.12em] shadow-[0_10px_18px_rgba(15,23,42,0.08)] transition ${
        getBlueprintSlotClasses({ isBookable: isOpen, slotType, isSelected })
      } ${rotated ? 'rotate-180' : ''} ${isOpen ? 'cursor-pointer hover:brightness-[0.98] active:scale-[0.98]' : 'cursor-not-allowed opacity-80'}`}
      title={`${slotNumber} • ${isOpen ? 'Open' : 'Busy'}`}
    >
      <div className={`${rotated ? 'rotate-180' : ''} flex h-full w-full flex-col items-center justify-between px-1 py-1.5`}>
        <div className="h-1.5 w-full rounded-full bg-black/10" aria-hidden="true" />

        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="leading-none">{slotNumber}</div>
          {!isOpen ? <VehicleIcon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" /> : null}
          {slotType === 'ev' ? <Zap className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          {(slotType === 'disabled' || slotType === 'disable') ? (
            <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
          ) : null}
        </div>

        <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] opacity-80">
          {isSelected ? 'SEL' : isOpen ? 'OPEN' : 'BUSY'}
        </div>
      </div>
    </button>
  );
};

const SlotTile = ({ slot, isSelected, onSelect, vehicleType }) => {
  const isOpen = !!slot?.isBookable;
  const slotNumber = slot?.slotNumber || '--';
  const badge = slotTypeBadge(slot?.slotType);
  const VehicleIcon = vehicleType === 'bike' ? Bike : Car;
  const statusLabel = isSelected ? 'SELECTED' : isOpen ? 'OPEN' : 'BUSY';

  return (
    <button
      type="button"
      disabled={!isOpen}
      onClick={() => onSelect?.(slot)}
      className={`group min-w-0 w-full rounded-[16px] border px-3 py-2 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300/50 h-[84px] sm:h-[88px] ${
        isSelected
          ? 'border-blue-400 bg-blue-50 shadow-[0_12px_36px_rgba(14,165,233,0.14)]'
          : isOpen
            ? 'border-[rgba(14,165,233,0.16)] bg-white hover:border-blue-200 hover:bg-[var(--color-muted-surface)]'
            : 'border-slate-100 bg-slate-50'
      } ${isOpen ? 'cursor-pointer active:scale-[0.99]' : 'cursor-not-allowed opacity-80'}`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div
            className={`min-w-0 truncate text-[13px] font-semibold tracking-[0.12em] sm:tracking-[0.16em] ${
              isSelected ? 'text-blue-700' : isOpen ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {slotNumber}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <VehicleIcon
              className={`h-4 w-4 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}
              aria-hidden="true"
            />
            {badge ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ${badge.className}`}
              >
                <badge.Icon className="h-3 w-3" />
                {badge.label}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div
            className={`min-w-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] ${
              isSelected ? 'text-blue-700' : isOpen ? 'text-slate-500' : 'text-slate-400'
            }`}
            title={statusLabel}
          >
            {statusLabel}
          </div>
          <span className="h-[22px] w-[1px]" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
};

const ParkingLotSlotMap = ({
  floors = [],
  activeFloorNumber,
  onSelectFloorNumber,
  slots,
  leftSlots = [],
  rightSlots = [],
  selectedSlotId,
  onSelectSlot,
  entryLabel = 'ENTRY',
  title = 'A & B Slots',
  onNext,
  nextDisabled = false,
  nextLabel = 'Next',
  vehicleType = 'car',
  variant = 'card',
  onBack,
  backLabel = '← Back',
}) => {
  const [selectedSlotType, setSelectedSlotType] = useState('All');
  const isBlueprint = variant === 'blueprint';

  const filteredSlots = useMemo(() => {
    const source = slots || [];
    if (selectedSlotType === 'All') return source;
    if (selectedSlotType === 'Normal')
      return source.filter((slot) => slot?.slotType !== 'ev' && slot?.slotType !== 'disabled' && slot?.slotType !== 'disable');
    if (selectedSlotType === 'EV') return source.filter((slot) => slot?.slotType === 'ev');
    if (selectedSlotType === 'Disable')
      return source.filter((slot) => slot?.slotType === 'disabled' || slot?.slotType === 'disable');
    return source;
  }, [selectedSlotType, slots]);

  const resolvedSides = useMemo(() => {
    const hasExplicitSides = leftSlots.length || rightSlots.length;
    if (hasExplicitSides) {
      return { left: sortSlots(leftSlots), right: sortSlots(rightSlots) };
    }
    return splitSlotsIntoSides(filteredSlots);
  }, [filteredSlots, leftSlots, rightSlots]);

  const floorIndex = useMemo(() => {
    if (!floors?.length) return -1;
    const index = floors.findIndex((floor) => floor.floorNumber === activeFloorNumber);
    return index >= 0 ? index : 0;
  }, [floors, activeFloorNumber]);

  const canPrev = floors.length > 0 && floorIndex > 0;
  const canNext = floors.length > 0 && floorIndex >= 0 && floorIndex < floors.length - 1;

  const goPrev = () => {
    if (!canPrev) return;
    onSelectFloorNumber?.(floors[floorIndex - 1]?.floorNumber);
  };

  const goNext = () => {
    if (!canNext) return;
    onSelectFloorNumber?.(floors[floorIndex + 1]?.floorNumber);
  };

  return (
    <div
      className={`relative ${
        isBlueprint
          ? 'bg-transparent p-0 m-0 w-full max-w-6xl mx-auto px-4'
          : 'rounded-[30px] border border-[rgba(14,165,233,0.14)] bg-[linear-gradient(145deg,#ffffff_0%,#edf4fd_100%)] shadow-[0_24px_70px_rgba(17,31,26,0.08)]'
      }`}
    >
      {!isBlueprint ? (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(14,165,233,0.14)] bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-[var(--color-muted-surface)] disabled:opacity-40"
              aria-label="Previous floor"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex flex-1 items-center justify-center">
              <div className="flex max-w-full gap-2 overflow-x-auto rounded-full border border-[rgba(14,165,233,0.14)] bg-white p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(floors || []).map((floor) => {
                  const isActive = floor.floorNumber === activeFloorNumber;
                  return (
                    <button
                      key={floor.floorNumber}
                      type="button"
                      onClick={() => onSelectFloorNumber?.(floor.floorNumber)}
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-tight transition ${
                        isActive
                          ? 'bg-[var(--color-primary)] text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-[var(--color-muted-surface)]'
                      }`}
                    >
                      {floor.label || `Floor ${floor.floorNumber}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(14,165,233,0.14)] bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-[var(--color-muted-surface)] disabled:opacity-40"
              aria-label="Next floor"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-transparent text-transparent">
                <ChevronLeft className="h-4 w-4 opacity-0" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold tracking-tight text-[var(--color-secondary)]">{title}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">{entryLabel}</div>
            </div>
            <div className="inline-flex items-center gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-transparent text-transparent">
                <ChevronRight className="h-4 w-4 opacity-0" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {['All', 'Normal', 'EV', 'Disable'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedSlotType(type)}
                  className={`rounded-full px-3.5 py-2 text-[11px] font-semibold transition-all ${
                    selectedSlotType === type
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'border border-[rgba(14,165,233,0.14)] bg-white text-slate-700 hover:bg-[var(--color-muted-surface)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="rounded-full border border-[rgba(14,165,233,0.14)] bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm">
              {vehicleType === 'bike' ? 'Bike slots' : 'Car slots'}
            </div>
          </div>
        </div>
      ) : null}

      <div className={isBlueprint ? 'pb-4 pt-6' : 'px-4 pb-4 pt-4'}>
        {isBlueprint ? (
          <div className="bg-transparent p-0 m-0">
            <div className="flex justify-center items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-6 gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    disabled={!onBack}
                  >
                    {backLabel}
                  </button>

                  <div className="flex flex-1 justify-center">
                    <div className="flex gap-2 flex-wrap items-center justify-center">
                      <div className="relative">
                        <select
                          value={activeFloorNumber ?? ''}
                          onChange={(e) => onSelectFloorNumber?.(Number(e.target.value))}
                          className="appearance-none px-4 py-2 pr-9 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                          disabled={!floors?.length}
                          aria-label="Select floor"
                        >
                          {(floors || []).map((floor) => (
                            <option key={floor.floorNumber} value={floor.floorNumber}>
                              {floor.label || `Floor ${floor.floorNumber}`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>

                      {['All', 'Normal', 'EV', 'Disable'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedSlotType(type)}
                          className={`px-4 py-2 bg-white border rounded-lg text-sm font-semibold transition ${
                            selectedSlotType === type
                              ? 'border-blue-600 text-blue-700 bg-blue-50'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!onNext || nextDisabled}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {nextLabel === 'Next' ? 'Done' : nextLabel}
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="w-full">
                    <div className="flex justify-center gap-3 flex-wrap">
                      {resolvedSides.left.map((slot) => (
                        <BlueprintSlotTile
                          key={slot.id}
                          slot={slot}
                          isSelected={selectedSlotId === slot.id}
                          onSelect={onSelectSlot}
                          vehicleType={vehicleType}
                          rotated={false}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-4xl">
                      <div className="bg-slate-300 h-14 rounded-full relative flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(100,116,139,0.45)]">
                        <div className="border-t border-dashed border-slate-500 w-[90%]" aria-hidden="true" />

                        <div className="absolute top-[-30px] left-0 flex items-center gap-2">
                          <span className="text-xs font-bold text-red-600">EXIT</span>
                          <div className="w-6 h-[2px] bg-red-500" aria-hidden="true" />
                        </div>

                        <div className="absolute bottom-[-30px] right-0 flex items-center gap-2">
                          <div className="w-6 h-[2px] bg-green-500" aria-hidden="true" />
                          <span className="text-xs font-bold text-green-600">{entryLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="flex justify-center gap-3 flex-wrap">
                      {resolvedSides.right.map((slot) => (
                        <BlueprintSlotTile
                          key={slot.id}
                          slot={slot}
                          isSelected={selectedSlotId === slot.id}
                          onSelect={onSelectSlot}
                          vehicleType={vehicleType}
                          rotated
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-[26px] border border-[rgba(14,165,233,0.14)] bg-white px-4 py-4 shadow-sm">
            <div className="grid grid-cols-[minmax(0,1fr),48px,minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(0,1fr),74px,minmax(0,1fr)] sm:gap-3">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                {resolvedSides.left.map((slot) => (
                  <SlotTile
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelect={onSelectSlot}
                    vehicleType={vehicleType}
                  />
                ))}
              </div>

              <div className="relative flex flex-col items-center justify-between">
                <div className="absolute inset-y-6 left-1/2 w-0 -translate-x-1/2 border-l-2 border-dashed border-slate-200" />

                <div className="relative z-10 flex flex-col items-center gap-3 pt-1">
                  <div className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.32em] text-slate-600 shadow-sm">
                    EXIT
                  </div>
                  <ChevronUp className="h-6 w-6 text-slate-400" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3 pb-1">
                  <ChevronDown className="h-6 w-6 text-blue-500" />
                  <div className="rounded-full border border-blue-100 bg-[var(--color-primary)] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.32em] text-white shadow-sm">
                    {entryLabel}
                  </div>
                </div>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                {resolvedSides.right.map((slot) => (
                  <SlotTile
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelect={onSelectSlot}
                    vehicleType={vehicleType}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {onNext && !isBlueprint ? (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="mt-4 w-full rounded-full bg-[var(--color-primary)] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_46px_rgba(14,165,233,0.22)] transition hover:bg-[#0369a1] disabled:opacity-60"
          >
            {nextLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ParkingLotSlotMap;
