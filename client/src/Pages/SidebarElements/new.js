<>


 <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <p>License number</p>
                          <button
                            onClick={() =>
                              setShowLicenseSortDropdown((prev) => !prev)
                            }
                            className="p-1 border rounded-sm border-slate-50 bg-slate-50 text-sm"
                            title="Sort Order"
                          >
                            🔽
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="License No"
                          value={filterLicense}
                          onChange={(e) => setFilterLicense(e.target.value)}
                          className="p-1 border rounded-md w-full h-8 placeholder-fuchsia-800"
                        />
                      </div>




</>
                      