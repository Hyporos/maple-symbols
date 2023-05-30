import React from 'react'

const Lost = () => {
  return (
    <>
    <div className="h-[350px] w-px mx-8 bg-gradient-to-t from-transparent via-white to-transparent opacity-10"></div>

    <div className="flex flex-col space-y-12 px-10 w-[330px]">
      <div className="symbol-stats">
        <p>
          <span>vjDaysRemaining</span> days to go
        </p>
        <p>
          Complete on <span>vjCompletionDate</span>
        </p>
      </div>

      <div className="symbol-stats">
        <p>
          <span>vjTotalSymbols</span> total symbols
        </p>
        <p>
          <span>vjRemainingSymbols</span> symbols remaining
        </p>
      </div>

      <div className="symbol-stats">
        <p>
          <span>vjSpentMesos.toLocaleString</span> total mesos
        </p>
        <p>
          <span>vjRemainingMesos.toLocaleString</span> mesos required
        </p>
      </div>
    </div>
    </>
  )
}

export default Lost